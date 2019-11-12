import findLast from "lodash/findLast";
import get from "lodash/get";
import last from "lodash/last";
import groupBy from "lodash/groupBy";
import difference from "lodash/difference";
import {round} from "../helpers/getRoundedBbox";
import {useMemo, useContext} from "react";
import {getDepartureMoment} from "../helpers/time";
import {TIMEZONE} from "../constants";
import moment from "moment-timezone";
import {text} from "../helpers/text";
import {StoreContext} from "../stores/StoreContext";

const stopEventTypes = ["DEP", "PDE", "ARR", "ARS"];
const lastStopEventTypes = ["ARR", "ARS"];

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

function checkFirstStopDeparture(events, visitedStops, incrementHealth, addMessage) {
  const {stopId = ""} = visitedStops[0] || {};

  if (stopId) {
    const firstStopDeparture = events.find(
      (evt) => evt.stopId === stopId && evt.type === "DEP"
    );

    if (!firstStopDeparture) {
      addMessage(`${text("journey.health.origin_event_missing")} ${stopId}`);
      incrementHealth(0); // Exit pending state
      return;
    }

    if (!firstStopDeparture._isVirtual) {
      incrementHealth(100);
    } else if (firstStopDeparture._isVirtual) {
      addMessage(`${text("journey.health.origin_event_virtual")} ${stopId}.`);

      incrementHealth(50);
    }
  }
}

function checkLastStopArrival(events, lastStop, incrementHealth, addMessage) {
  if (lastStop) {
    const lastStopArrival = events.find(
      (evt) => evt.stopId === lastStop && evt.type === "ARS"
    );

    if (!lastStopArrival) {
      addMessage(`${text("journey.health.destination_event_missing")} ${lastStop}`);
      incrementHealth(0); // exit pending state
      return;
    }

    if (!lastStopArrival._isVirtual) {
      incrementHealth(100);
    } else {
      addMessage(`${text("journey.health.destination_event_virtual")} ${lastStop}.`);
      incrementHealth(50);
    }
  }
}

function checkTimingStopDepartures(events, visitedStops, incrementHealth, addMessage) {
  const timingStops = visitedStops.filter((stop) => !!stop.isTimingStop);

  if (timingStops.length !== 0) {
    for (const {stopId} of timingStops) {
      const timingStopDeparture = events.find(
        (evt) => evt.stopId === stopId && evt.type === "DEP"
      );

      if (!timingStopDeparture) {
        addMessage(`${text("journey.health.timing_event_missing")} ${stopId}`);
        incrementHealth(0); // Exit pending state
        continue;
      }

      if (!timingStopDeparture._isVirtual) {
        incrementHealth(100);
      } else {
        addMessage(`${text("journey.health.timing_event_virtual")} ${stopId}.`);
        incrementHealth(50);
      }
    }
  } else {
    incrementHealth(100);
  }
}

// Evaluate the health of position events by checking that they were recorded within
// 5 seconds of each other.
function checkPositionEventsHealth(positionEvents, incrementHealth, addMessage) {
  const positionsLength = get(positionEvents, "length", 0);

  if (!positionEvents || !positionsLength) {
    addMessage(text("journey.health.positions_not_found"));
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
      addMessage(`${text("journey.health.positions_gap")}: ${diff}`);
      incrementHealth(-(diff * 2));
    }

    prevTsi = event.recordedAtUnix;
  }
}

function checkStopEventsHealth(stopEvents, plannedStops, incrementHealth, addMessage) {
  const stopEventsLength = get(stopEvents, "length", 0);

  if (!stopEvents || stopEventsLength === 0) {
    addMessage(text("journey.health.stop_events_not_found"));
    return;
  }

  const eventGroups = groupBy(stopEvents, "stopId");
  const lastStop = get(last(plannedStops), "stopId", "");

  for (const {stopId} of plannedStops) {
    const eventsForStop = get(eventGroups, stopId, []);
    const virtualStopEvents = [];

    for (const stopEvent of eventsForStop) {
      if (stopEvent._isVirtual) {
        virtualStopEvents.push(stopEvent.type);
        incrementHealth(1);
      } else {
        incrementHealth(2);
      }
    }

    if (virtualStopEvents.length !== 0) {
      addMessage(
        `${text("journey.health.stop_event_virtual")} ${stopId}: ${virtualStopEvents.join(
          ", "
        )}`
      );
    }

    const stopTypesForStop = lastStop === stopId ? lastStopEventTypes : stopEventTypes;

    if (eventsForStop.length < stopTypesForStop.length) {
      const presentEvents = eventsForStop.map((evt) => evt.type);
      const missingEvents = difference(stopTypesForStop, presentEvents);
      addMessage(
        `${text("journey.health.stop_event_missing")} ${stopId}: ${missingEvents.join(
          ", "
        )}`
      );
      incrementHealth(-(missingEvents.length * 6));
    }
  }
}

export const useJourneyHealth = (journey) => {
  const {state} = useContext(StoreContext);

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
    // we know are in the future. That wouldn't be fair!
    const lastStopVisited = vehiclePositions.some(
      (evt) => evt.nextStopId === "EOL" || evt.stop === lastPlannedStop
    );

    // The planned duration of the journey is available, which we'll use to check
    // if the journey SHOULD be concluded.
    const journeyDuration = get(journey, "journeyDurationMinutes", 0);
    const departure = get(journey, "departure", {});

    const journeyStartMoment = getDepartureMoment(departure).add(
      journeyDuration,
      "minutes"
    );

    // If the start time + the planned duration is in the past, the journey SHOULD be
    // concluded and we can evaluate the data as a completed journey.
    const journeyShouldBeConcluded = journeyStartMoment.isSameOrBefore(
      moment.tz(new Date(), TIMEZONE)
    );

    // The journey is evaluated as a completed journey when either the last stop
    // is visited or the planned duration time is reached.
    const journeyIsConcluded = lastStopVisited || journeyShouldBeConcluded;

    // Get a slice of the visited stops from the planned departures.
    const visitedStops = plannedDepartures.slice(0, stopsVisitedCount);
    // Get all timing stops. If there are any, we check that it has the required departure events.
    const timingStops = plannedDepartures.filter((dep) => !!dep.isTimingStop);

    // Health scores that are scored with a percentage. If data is missing the
    // percentage is lower. Also includes messages that the validators can add
    // which can help explain why the score is below 100%. The max value is used
    // to calculate the percentage and is not returned from this function.
    const healthScores = {
      // Max is number of stops * number of stop events * 2 points per event. Deduct last stop departure events.
      stops: {
        health: 0,
        max: stopsVisitedCount * stopEventTypes.length * 2 - 4,
        messages: [],
      },
      // Max is how many VP events we have. We only check that the events are
      // < 5 seconds apart, not that the whole journey is covered.
      positions: {health: 0, max: vehiclePositions.length, messages: []},
      firstStopDeparture: {health: 0, max: 100, messages: []},
      lastStopArrival: {health: -1, max: 100, messages: []},
    };

    if (timingStops.length !== 0) {
      healthScores.timingStopDepartures = {
        health: -1,
        max: Math.max(100, timingStops.length * 100),
        messages: [],
      };
    }

    // Function that increments the health points for a specific health check.
    const onIncrementHealth = (which) => (addPoints = 0) => {
      const currentHealth = healthScores[which].health;
      let pointsToAdd = addPoints;

      // Health checks that are pending have a value of -1. If we are adding points,
      // it means that the health check is no longer pending, so we also pull it
      // out from the pending state while adding points.
      if (currentHealth === -1) {
        pointsToAdd += 1;
      }

      healthScores[which].health = Math.max(0, currentHealth + pointsToAdd);
    };

    // Health scores that are scored with a boolean. If any of these are "false", the
    // data is insufficient and should not be relied upon. They can also be pending if,
    // for example, the journey is ongoing and hasn't reached a timing stop yet. Pending
    // checks are not counted in the total health score.
    const checklist = {
      GPS: {status: HealthChecklistValues.PENDING, messages: []},
      doors: {status: HealthChecklistValues.PENDING, messages: []},
    };

    // Function that adds a message for a specific health check.
    const onAddMessage = (which, list = healthScores) => (message) => {
      list[which].messages.push(message);
    };

    // Approve or fail a binary health check.
    const onChecklistChange = (which) => (setValue = HealthChecklistValues.PASSED) => {
      checklist[which].status = setValue;
    };

    // Check the health of the vehicle position events stream.
    checkPositionEventsHealth(
      vehiclePositions,
      onIncrementHealth("positions"),
      onAddMessage("positions", healthScores)
    );

    // Check the health of stop events.
    checkStopEventsHealth(
      stopEvents,
      journeyIsConcluded ? plannedDepartures : visitedStops,
      onIncrementHealth("stops"),
      onAddMessage("stops", healthScores)
    );

    // Check the departure from the first stop.
    checkFirstStopDeparture(
      stopEvents,
      plannedDepartures,
      onIncrementHealth("firstStopDeparture"),
      onAddMessage("firstStopDeparture", healthScores)
    );

    // Keep these pending until the journey is complete
    if (journeyIsConcluded) {
      // Check that the last stop arrival event is present.
      checkLastStopArrival(
        stopEvents,
        lastPlannedStop,
        onIncrementHealth("lastStopArrival"),
        onAddMessage("lastStopArrival", healthScores)
      );

      if (typeof healthScores.timingStopDepartures !== "undefined") {
        // Check that important timing stop events are present.
        checkTimingStopDepartures(
          stopEvents,
          plannedDepartures,
          onIncrementHealth("timingStopDepartures"),
          onAddMessage("timingStopDepartures", healthScores)
        );
      }
    }

    // Check that the vehicle has functioning door sensors.
    checkDoorEventsHealth(
      events,
      onChecklistChange("doors"),
      onAddMessage("doors", checklist)
    );

    // Check that the vehicle GPS is working.
    checkGPS(vehiclePositions, onChecklistChange("GPS"), onAddMessage("GPS", checklist));

    // Calculate the percentage scores
    const calculatedScores = Object.entries(healthScores).reduce(
      (categories, [name, {health, max, messages}]) => {
        if (health === -1) {
          categories[name] = {health: health, messages: messages};
          return categories;
        }

        const healthScore = health === 0 ? 0 : round((health / Math.max(1, max)) * 100);
        categories[name] = {health: healthScore, messages: messages};
        return categories;
      },
      {}
    );

    // Get all criteria as number scores. Binary checks are worth 100 if true or 0 if false.
    const allCriteria = [
      ...Object.values(calculatedScores)
        .filter(({health}) => health !== -1) // Skip pending states.
        .map(({health}) => health),
      ...Object.values(checklist)
        .filter(({status}) => status !== HealthChecklistValues.PENDING) // Skip pending states.
        .map(({status}) => (status === HealthChecklistValues.PASSED ? 100 : 0)),
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
  }, [journey, state.language]);

  return journeyHealth;
};
