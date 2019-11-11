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
    }
  }
}

export const useJourneyHealth = (journey) => {
  const journeyHealth = useMemo(() => {
    const journeyEvents = get(journey, "events", []);
    const vehiclePositions = get(journey, "vehiclePositions", []);
    const plannedDepartures = get(journey, "routeDepartures", []);

    if (
      !journey ||
      plannedDepartures.length === 0 ||
      (journeyEvents.length === 0 && vehiclePositions.length === 0)
    ) {
      return null;
    }

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

    const checkStopsFrom = vehiclePositions.length !== 0 ? vehiclePositions : stopEvents;
    const lastEventWithStop = findLast(checkStopsFrom, (pos) =>
      pos.stop ? !!pos.stop : !!pos.stopId
    );

    const maxDrivenStop = get(
      lastEventWithStop,
      "stop",
      get(lastEventWithStop, "stopId", "")
    );

    const stopsVisitedCount = plannedDepartures.findIndex(
      (dep) => dep.stopId === maxDrivenStop
    );

    const lastPlannedStop = get(last(plannedDepartures), "stopId");

    const journeyIsConcluded = vehiclePositions.some(
      (evt) => evt.nextStopId === "EOL" || evt.stop === lastPlannedStop
    );

    const visitedStops = plannedDepartures.slice(0, stopsVisitedCount);

    const healthScores = {
      stops: {health: 0, max: stopsVisitedCount * 4, messages: []},
      positions: {health: 0, max: vehiclePositions.length, messages: []},
    };

    const onIncrementHealth = (which) => (addPoints = 0) => {
      healthScores[which].health += addPoints;
    };

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

    const onChecklistChange = (which) => (setValue = HealthChecklistValues.PASSED) => {
      checklist[which] = setValue;
    };

    const onAddMessage = (which) => (message) => {
      healthScores[which].messages.push(message);
    };

    checkPositionEventsHealth(
      vehiclePositions,
      onIncrementHealth("positions"),
      onAddMessage("positions")
    );

    checkStopEventsHealth(
      stopEvents,
      visitedStops,
      onIncrementHealth("stops"),
      onAddMessage("stops")
    );

    checkDoorEventsHealth(events, onChecklistChange("doors"));

    checkFirstStopDeparture(
      stopEvents,
      plannedDepartures,
      onChecklistChange("firstStopDeparture")
    );
    checkGPS(vehiclePositions, onChecklistChange("GPS"));

    // Keep these pending until the journey is complete
    if (journeyIsConcluded) {
      checkLastStopArrival(
        stopEvents,
        lastPlannedStop,
        onChecklistChange("lastStopArrival")
      );

      if (typeof checklist.timingStopDepartures !== "undefined") {
        checkTimingStopDepartures(
          stopEvents,
          plannedDepartures,
          onChecklistChange("timingStopDepartures")
        );
      }
    }

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

    const allCriteria = [
      ...Object.values(calculatedScores).map((val) => val.health),
      ...Object.values(checklist)
        .filter((check) => check !== HealthChecklistValues.PENDING)
        .map((check) => (check === HealthChecklistValues.PASSED ? 100 : 0)),
    ];

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
