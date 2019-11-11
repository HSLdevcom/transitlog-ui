import findLast from "lodash/findLast";
import get from "lodash/get";
import last from "lodash/last";
import groupBy from "lodash/groupBy";
import difference from "lodash/difference";
import {round} from "../helpers/getRoundedBbox";
import {useMemo} from "react";

const stopEventTypes = ["DEP", "PDE", "ARR", "ARS"];

export const HealthChecklistValues = {
  PASSED: "passed",
  FAILED: "failed",
  PENDING: "pending",
};

function checkDoorEventsHealth(events, setState) {
  if (events.some((evt) => ["DOO", "DOC"].includes(evt.type) || !!evt.doorsOpened)) {
    setState(HealthChecklistValues.PASSED);
  } else if (events.length !== 0) {
    setState(HealthChecklistValues.FAILED);
  }
}

function checkGPS(positions, setState) {
  if (
    positions.some((evt) => typeof evt.lat === "number" && typeof evt.lng === "number")
  ) {
    setState(HealthChecklistValues.PASSED);
  } else if (positions.length !== 0) {
    setState(HealthChecklistValues.FAILED);
  }
}

function checkFirstStopDeparture(events, visitedStops, setState) {
  const {stopId = ""} = visitedStops[0] || {};

  if (stopId) {
    const firstStopDeparture = events.find(
      (evt) => evt.stopId === stopId && evt.type === "DEP"
    );

    if (firstStopDeparture) {
      setState(HealthChecklistValues.PASSED);
    } else {
      setState(HealthChecklistValues.FAILED);
    }
  }
}

function checkLastStopArrival(events, lastStop, setState) {
  if (lastStop) {
    const lastStopArrival = events.find(
      (evt) => evt.stopId === lastStop && evt.type === "ARS"
    );

    if (lastStopArrival) {
      setState(HealthChecklistValues.PASSED);
    } else {
      setState(HealthChecklistValues.FAILED);
    }
  }
}

function checkTimingStopDepartures(events, visitedStops, setState) {
  const timingStops = visitedStops.filter((stop) => !!stop.isTimingStop);

  if (timingStops.length !== 0) {
    for (const {stopId} of timingStops) {
      const timingStopDeparture = events.find(
        (evt) => evt.stopId === stopId && evt.type === "DEP"
      );

      if (!timingStopDeparture) {
        setState(HealthChecklistValues.FAILED);
        return;
      }
    }

    setState(HealthChecklistValues.PASSED);
  } else {
    setState(HealthChecklistValues.PASSED);
  }
}

function checkPositionEventsHealth(positionEvents, incrementHealth, addMessage) {
  const positionsLength = get(positionEvents, "length", 0);

  if (!positionEvents || !positionsLength) {
    addMessage("No position events found.");
    return;
  }

  let prevTsi = 0;

  for (const event of positionEvents) {
    if (prevTsi === 0) {
      prevTsi = event.recordedAtUnix;
      continue;
    }

    const diff = Math.abs(event.recordedAtUnix - prevTsi);

    if (diff <= 5) {
      incrementHealth(1);
    } else {
      addMessage(`Gap of ${diff} seconds detected in vehicle positions.`);
      incrementHealth(-(diff * 2));
    }

    prevTsi = event.recordedAtUnix;
  }
}

function checkStopEventsHealth(stopEvents, plannedStops, incrementHealth, addMessage) {
  const stopEventsLength = get(stopEvents, "length", 0);

  if (!stopEvents || stopEventsLength === 0) {
    addMessage("No stop events found.");
    return;
  }

  const eventGroups = groupBy(stopEvents, "stopId");

  for (const {stopId} of plannedStops) {
    const eventsForStop = get(eventGroups, stopId, []);
    incrementHealth(eventsForStop.length);

    if (eventsForStop.length < stopEventTypes.length) {
      const presentEvents = eventsForStop.map((evt) => evt.type);
      const missingEvents = difference(stopEventTypes, presentEvents);
      addMessage(`Events missing for stop ${stopId}: ${missingEvents.join(", ")}`);
      incrementHealth(-(missingEvents.length * 5));
    }
  }
}

export const useJourneyHealth = (journey) => {
  const journeyHealth = useMemo(() => {
    const journeyEvents = get(journey, "events", []);
    const vehiclePositions = get(journey, "vehiclePositions", []);
    const plannedDepartures = get(journey, "routeDepartures", []);

    // Ensure we have all required data. Bail here is not.
    if (
      !journey ||
      plannedDepartures.length === 0 ||
      (journeyEvents.length === 0 && vehiclePositions.length === 0)
    ) {
      return null;
    }

    // Separate events into stop events and non-stop events.
    const {stopEvents, events} = journeyEvents.reduce(
      (categories, event) => {
        if (stopEventTypes.includes(event.type)) {
          categories.stopEvents.push(event);
        } else {
          categories.events.push(event);
        }

        return categories;
      },
      {stopEvents: [], events: []}
    );

    // Get the furthest stop that we have events from. For journeys that are in
    // progress, the data is validated up to here. In other words we don't expect
    // events to be present from stops that are in the future of the journey. The
    // furthest driven stop is checked from the vehicle positions to disentangle
    // this check from the data that we are actually checking; the stop events.
    const lastEventWithStop = findLast(vehiclePositions, (pos) => !!pos.stop);
    const maxDrivenStop = get(lastEventWithStop, "stop", "");

    // The index of the max stop.
    const stopsVisitedCount = plannedDepartures.findIndex(
      (dep) => dep.stopId === maxDrivenStop
    );

    // This is the destination stop of the journey.
    const lastPlannedStop = get(last(plannedDepartures), "stopId");

    // Check if the journey has finished. If not, we won't check for events that
    // we know are in the future. That just wouldn't be fair!
    const journeyIsConcluded = vehiclePositions.some(
      (evt) => evt.nextStopId === "EOL" || evt.stop === lastPlannedStop
    );

    // Get a slice of the visited stops from the planned departures.
    const visitedStops = plannedDepartures.slice(0, stopsVisitedCount);

    // Health scores that are scored with a percentage. If data is missing the
    // percentage is lower. Also includes messages that the validators can add
    // which can help explain why the score is below 100%. The max value is used
    // to calculate the percentage and is not returned from this function.
    const healthScores = {
      stops: {health: 0, max: stopsVisitedCount * 4, messages: []},
      positions: {health: 0, max: vehiclePositions.length, messages: []},
    };

    // Function that increments the health points for a specific health check.
    const onIncrementHealth = (which) => (addPoints = 0) => {
      const currentHealth = healthScores[which].health;
      healthScores[which].health = Math.max(0, currentHealth + addPoints);
    };

    // Function that adds a message for a specific health check.
    const onAddMessage = (which) => (message) => {
      healthScores[which].messages.push(message);
    };

    // Health scores that are scored with a boolean. If any of these are "false", the
    // data is insufficient and should not be relied upon. They can also be pending if,
    // for example, the journey is ongoing and hasn't reached a timing stop yet. Pending
    // checks are not counted in the total health score.
    const checklist = {
      firstStopDeparture: HealthChecklistValues.PENDING,
      lastStopArrival: HealthChecklistValues.PENDING,
      GPS: HealthChecklistValues.PENDING,
      doors: HealthChecklistValues.PENDING,
    };

    // Only add the timing stop checks if there are timing stops.
    if (plannedDepartures.some((dep) => !!dep.isTimingStop)) {
      checklist.timingStopDepartures = HealthChecklistValues.PENDING;
    }

    // Approve or fail a binary health check.
    const onChecklistChange = (which) => (setValue = HealthChecklistValues.PASSED) => {
      checklist[which] = setValue;
    };

    // Check the health of the vehicle position events stream.
    checkPositionEventsHealth(
      vehiclePositions,
      onIncrementHealth("positions"),
      onAddMessage("positions")
    );

    // Check the health of stop events.
    checkStopEventsHealth(
      stopEvents,
      journeyIsConcluded ? plannedDepartures : visitedStops,
      onIncrementHealth("stops"),
      onAddMessage("stops")
    );

    // Check that the vehicle has functioning door sensors.
    checkDoorEventsHealth(events, onChecklistChange("doors"));

    // Check the departure from the first stop.
    checkFirstStopDeparture(
      stopEvents,
      plannedDepartures,
      onChecklistChange("firstStopDeparture")
    );

    // Check that the vehicle GPS is working.
    checkGPS(vehiclePositions, onChecklistChange("GPS"));

    // Keep these pending until the journey is complete
    if (journeyIsConcluded) {
      // Check that the last stop arrival event is present.
      checkLastStopArrival(
        stopEvents,
        lastPlannedStop,
        onChecklistChange("lastStopArrival")
      );

      if (typeof checklist.timingStopDepartures !== "undefined") {
        // Check that important timing stop events are present.
        checkTimingStopDepartures(
          stopEvents,
          plannedDepartures,
          onChecklistChange("timingStopDepartures")
        );
      }
    }

    // Calculate the percentage scores
    const calculatedScores = Object.entries(healthScores).reduce(
      (categories, [name, values]) => {
        const healthScore =
          values.health === 0
            ? 0
            : round((values.health / Math.max(1, values.max)) * 100);
        categories[name] = {health: healthScore, messages: values.messages};
        return categories;
      },
      {}
    );

    // Get all criteria as a number score. Binary checks give 100 if true or 0 if false.
    const allCriteria = [
      ...Object.values(calculatedScores).map((val) => val.health),
      ...Object.values(checklist)
        .filter((check) => check !== HealthChecklistValues.PENDING) // Skip pending states.
        .map((check) => (check === HealthChecklistValues.PASSED ? 100 : 0)),
    ];

    // Calculate the total health of the journey data.
    const totalHealth = allCriteria.some((val) => val === 0)
      ? 0
      : round(
          allCriteria.reduce((total, val) => total + val, 0) /
            Math.max(1, allCriteria.length)
        );

    return {
      checklist,
      health: calculatedScores,
      total: totalHealth,
      isDone: journeyIsConcluded,
    };
  }, [journey]);

  return journeyHealth;
};
