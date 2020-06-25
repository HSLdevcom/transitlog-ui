import get from "lodash/get";
import last from "lodash/last";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import flatten from "lodash/flatten";
import {round} from "../helpers/getRoundedBbox";
import {useMemo, useContext} from "react";
import {TIMEZONE} from "../constants";
import moment from "moment-timezone";
import {text} from "../helpers/text";
import {StoreContext} from "../stores/StoreContext";

export const HealthChecklistValues = {
  PASSED: "passed",
  FAILED: "failed",
  UNAVAILABLE: "unavailable",
  PENDING: "pending",
};

export const defaultThresholds = {
  ok: 97,
  warning: 75,
};

function checkDoorEventsHealth(events, setState) {
  if (events.some((evt) => ["DOO", "DOC"].includes(evt.type) || !!evt.doorsOpened)) {
    setState(HealthChecklistValues.PASSED);
  } else if (events.length !== 0) {
    setState(HealthChecklistValues.UNAVAILABLE);
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

function checkLocHealth(events, incrementHealth, addMessage) {
  let odoCount = 0;
  // PDE events are SUPPOSED to be triggered with the odometer, so exclude them from the check.
  // Filter out the PDE events if the events conform to the ODO-PDE spec.
  let eventsWithoutPDE = events.some((evt) => evt.type === "PDE" && evt.loc === "ODO")
    ? events.filter((evt) => evt.type !== "PDE")
    : events;

  for (const evt of eventsWithoutPDE) {
    if (typeof evt.loc !== "undefined" && evt.loc === "ODO") {
      odoCount++;
    }
  }

  const score = eventsWithoutPDE.length - odoCount;
  const percentage = round((odoCount / eventsWithoutPDE.length) * 100);

  incrementHealth(score);

  if (percentage < 100) {
    addMessage(`Events calculated with odometer: ${odoCount} (${percentage}%)`);
  }
}

function checkFirstStopDeparture(events, visitedStops, incrementHealth, addMessage) {
  const {stopId = ""} = visitedStops[0] || {};

  if (stopId) {
    const firstStopDeparture = events.find(
      (evt) =>
        evt.stopId === stopId &&
        ((evt.type === "PDE" && evt.loc === "ODO") || evt.type === "DEP")
    );

    if (!firstStopDeparture) {
      addMessage(`${text("journey.health.origin_event_missing")} ${stopId}`);
      incrementHealth(0); // Exit pending state
      return;
    }

    if (!firstStopDeparture._isVirtual || firstStopDeparture.loc === "MAN") {
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

    if (!lastStopArrival._isVirtual || lastStopArrival.loc === "MAN") {
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
        (evt) =>
          evt.stopId === stopId &&
          ((evt.type === "PDE" && evt.loc === "ODO") || evt.type === "DEP")
      );

      if (!timingStopDeparture) {
        addMessage(`${text("journey.health.timing_event_missing")} ${stopId}`);
        incrementHealth(0); // Exit pending state
        continue;
      }

      if (!timingStopDeparture._isVirtual || timingStopDeparture.loc === "MAN") {
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
function checkPositionEventsHealth(
  positionEvents,
  bounds,
  incrementHealth,
  addMessage,
  reportMax
) {
  const positionsLength = get(positionEvents, "length", 0);

  if (!positionEvents || !positionsLength) {
    addMessage(text("journey.health.positions_not_found"));
    return;
  }

  const {start = 0, end = 0} = bounds;

  // Catch gaps from the start of the journey by starting with the first stop event.
  // We also don't care about gaps that happen before this.
  // "tsi" = TimeStamp Integer, ie unix timestamp of event.
  let prevTsi = start || 0;

  let eventsChecked = 0;

  function assignPoints(diff) {
    if (diff <= 5) {
      incrementHealth(1);
    } else {
      addMessage(`${text("journey.health.positions_gap")}: ${diff}`);
      incrementHealth(-(diff * 2));
    }

    eventsChecked++;
  }

  for (const event of positionEvents) {
    if (prevTsi === 0) {
      prevTsi = event.recordedAtUnix;
    }

    if (prevTsi > event.recordedAtUnix) {
      continue;
    }

    if (end !== 0 && end < event.recordedAtUnix) {
      break;
    }

    const diff = Math.abs(event.recordedAtUnix - prevTsi);
    assignPoints(diff);
    prevTsi = event.recordedAtUnix;
  }

  // Catch gaps from the end of the journey.
  if (end > prevTsi) {
    const diff = Math.abs(end - prevTsi);
    assignPoints(diff);
  }

  reportMax(eventsChecked);
}

// Stop events can be of many types, and they appear in the subarrays in the preference order.
// For example, we prefer PDE events for stops but will accept DEP events if that's all we got.
const stopEventTypes = [["PDE", "DEP"], ["PDE", "PAS"], "ARR", ["ARS", "PAS"]];
const lastStopEventTypes = ["ARR", "ARS"];

function checkStopEventsHealth(stopEvents, plannedStops, incrementHealth, addMessage) {
  const stopEventsLength = get(stopEvents, "length", 0);

  if (!stopEvents || stopEventsLength === 0) {
    addMessage(text("journey.health.stop_events_not_found"));
    return;
  }

  const stopEventGroups = groupBy(stopEvents, "stopId");
  const lastStop = get(last(plannedStops), "stopId", "");

  for (const {stopId} of plannedStops) {
    // The last stop will usually not get departure events,
    // so we don't check departure events for the last stop.
    const stopTypesForStop = lastStop === stopId ? lastStopEventTypes : stopEventTypes;
    const recordedStopEvents = get(stopEventGroups, stopId, []);

    const eventsForStop = stopTypesForStop.reduce((countedEvents, eventType) => {
      const matchTypes = Array.isArray(eventType) ? eventType : [eventType];
      const recordedEvent = recordedStopEvents.find((evt) =>
        matchTypes.includes(evt.type)
      );

      if (recordedEvent) {
        countedEvents.push(recordedEvent);
      }

      return countedEvents;
    }, []);

    // Collect virtual events here, we will report them all at once in a message.
    const virtualStopEvents = [];

    for (const stopEvent of eventsForStop) {
      if (stopEvent._isVirtual && stopEvent.loc !== "MAN") {
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

    // Reduce points for missing events.
    if (eventsForStop.length < stopTypesForStop.length) {
      const missingEvents = stopTypesForStop.reduce((missing, eventType) => {
        const checkTypes = Array.isArray(eventType) ? eventType : [eventType];
        const isPresent = eventsForStop.some((evt) => checkTypes.includes(evt.type));

        if (!isPresent) {
          missing.push(checkTypes[0]);
        }

        return missing;
      }, []);

      if (missingEvents.length === 0) {
        return;
      }

      addMessage(
        `${text("journey.health.stop_event_missing")} ${stopId}: ${missingEvents.join(
          ", "
        )}`
      );

      // Reduce points for missing events with a multiplier.
      incrementHealth(-(missingEvents.length * 4));
    }
  }
}

export const useJourneyHealth = (journey) => {
  const {state} = useContext(StoreContext);

  const journeyHealth = useMemo(() => {
    const journeyEvents = get(journey, "events", []);
    const vehiclePositions = get(journey, "vehiclePositions", []);
    const plannedDepartures = orderBy(
      get(journey, "routeDepartures", []),
      "index",
      "asc"
    );

    // Get the last departure of the journey
    const journeyEndDeparture = plannedDepartures[plannedDepartures.length - 1];

    const lastPlannedArrival = get(
      journeyEndDeparture,
      "plannedArrivalTime.arrivalDateTime",
      ""
    );

    const lastStopPlannedUnix = lastPlannedArrival
      ? moment.tz(lastPlannedArrival, TIMEZONE).unix()
      : 0;

    let journeyIsConcluded = true;
    const currentUnix = Math.floor(Date.now() / 1000);

    if (lastStopPlannedUnix !== 0) {
      // If the planned arrival time at the last stop is in the past, the journey SHOULD be
      // concluded and we can evaluate the data as a completed journey.
      journeyIsConcluded = currentUnix > lastStopPlannedUnix;
    }

    // Ensure we have all required data. Bail here if not.
    if (
      !journey ||
      plannedDepartures.length === 0 ||
      (journeyEvents.length === 0 && vehiclePositions.length === 0)
    ) {
      return {
        checklist: [],
        health: [],
        total: 0,
        isDone: journeyIsConcluded,
      };
    }

    // Separate events into stop events and not-stop events.
    const {stopEvents, events} = journeyEvents.reduce(
      (categories, event) => {
        if (flatten(stopEventTypes).includes(event.type)) {
          categories.stopEvents.push(event);
        } else {
          categories.events.push(event);
        }

        return categories;
      },
      {stopEvents: [], events: []}
    );

    let visitedStops = plannedDepartures;
    let maxPlannedStops = visitedStops.length - 1;

    if (!journeyIsConcluded) {
      // Get the furthest stop that we have events from. For journeys that are in
      // progress, the data is validated up to here. In other words we don't expect
      // events to be present from stops that are in the future of the journey. The
      // furthest driven stop is retrieved by comparing the planned times to the
      // current time, to disentangle this variable from the stop events themselves.
      const furthestDepartureIndex = plannedDepartures.findIndex(
        (dep) =>
          moment.tz(dep.plannedDepartureTime.departureDateTime, TIMEZONE).unix() <=
          currentUnix + 5 * 60
      );

      // Get a slice of only the visited stops. Include the first departure as a minimum.
      visitedStops = plannedDepartures.slice(0, Math.max(1, furthestDepartureIndex));
      maxPlannedStops = furthestDepartureIndex;
    }

    // Get all timing stops. If there are any, we check that it has the required departure events.
    const timingStops = plannedDepartures.filter((dep) => !!dep.isTimingStop);

    const currentEndDeparture = visitedStops[visitedStops.length - 1];
    const currentLastPlannedArrival = get(
      currentEndDeparture,
      "plannedArrivalTime.arrivalDateTime",
      ""
    );

    const journeyEndStopEvent =
      orderBy(
        stopEvents.filter((se) => se.stopId === currentEndDeparture.stopId),
        "recordedAtUnix",
        "DESC"
      )[0] || null;

    // Health scores that are scored with a percentage. If data is missing the
    // percentage is lower. Also includes messages that the validators can add
    // which can help explain why the score is below 100%. The max value is used
    // to calculate the percentage and is not returned from this function.
    const healthScores = {
      // Max is number of stops * number of stop events * 2 points per event.
      // Deduct max points for the last stop departure events as they are not counted.
      stops: {
        health: 0,
        max: maxPlannedStops * stopEventTypes.length * 2 + lastStopEventTypes.length * 2,
        messages: [],
      },
      // Max is how many VP events we have. We only check that the events are
      // < 5 seconds apart, not that the whole journey is covered.
      positions: {health: 0, max: vehiclePositions.length, messages: []},
      locType: {
        health: 0,
        max: journeyEvents.length,
        messages: [],
        thresholds: {ok: 97, warning: 97},
      },
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

    const onReportMax = (which) => (maxPoints = 0) => {
      const currentMax = healthScores[which].max;
      healthScores[which].max = maxPoints || currentMax;
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

    // Get the first departure
    const journeyStartDeparture = plannedDepartures[0];
    const journeyStartStopEvent =
      orderBy(
        stopEvents.filter((se) => se.stopId === journeyStartDeparture.stopId),
        "recordedAtUnix",
        "ASC"
      )[0] || null;

    const firstPlannedDeparture = get(
      journeyStartDeparture,
      "plannedDepartureTime.departureDateTime",
      ""
    );

    const journeyStartPlannedUnix = firstPlannedDeparture
      ? moment.tz(firstPlannedDeparture, TIMEZONE).unix()
      : 0;

    const journeyEndPlannedUnix = currentLastPlannedArrival
      ? moment.tz(currentLastPlannedArrival, TIMEZONE).unix()
      : 0;

    // Check the health of the vehicle position events stream.
    checkPositionEventsHealth(
      vehiclePositions,
      {
        start: get(journeyStartStopEvent, "recordedAtUnix", journeyStartPlannedUnix),
        end: get(journeyEndStopEvent, "recordedAtUnix", journeyEndPlannedUnix),
      },
      onIncrementHealth("positions"),
      onAddMessage("positions", healthScores),
      onReportMax("positions")
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

    // This is the destination stop of the journey.
    const lastPlannedStop = last(plannedDepartures);
    const lastPlannedStopId = get(lastPlannedStop, "stopId");

    // Keep these pending until the journey is complete
    if (journeyIsConcluded) {
      // Check that the last stop arrival event is present.
      checkLastStopArrival(
        stopEvents,
        lastPlannedStopId,
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

    // Check that the odometer isn't used too much to calculate events.
    checkLocHealth(
      journeyEvents,
      onIncrementHealth("locType"),
      onAddMessage("locType", healthScores)
    );

    // Calculate the percentage scores
    const calculatedScores = Object.entries(healthScores).reduce(
      (
        categories,
        [name, {health, max, messages = [], thresholds = defaultThresholds}]
      ) => {
        if (health === -1) {
          categories[name] = {health: health, messages, thresholds};
          return categories;
        }

        const healthScore = health === 0 ? 0 : round((health / Math.max(1, max)) * 100);
        categories[name] = {health: healthScore, messages, thresholds};
        return categories;
      },
      {}
    );

    // Get the non-pending percentage score values for total health calculation.
    const scoreValues = Object.values(calculatedScores).filter(
      ({health}) => health !== -1
    ); // Skip pending states.

    // Get the non-pending binary check values for total health calculation.
    const checklistValues = Object.values(checklist).filter(
      ({status}) => status !== HealthChecklistValues.PENDING
    ); // Skip pending states.

    // Get all criteria as number scores. Binary checks are worth 100 if true or 0 if false.
    const allCriteria = [
      ...scoreValues.map(({health}) => health),
      ...checklistValues.map(({status}) =>
        status === HealthChecklistValues.PASSED ? 100 : 0
      ),
    ];

    // Calculate the total health of the journey data.
    const totalHealth = allCriteria.some((val) => val === 0)
      ? 0
      : round(
          allCriteria.reduce((total, val) => total + val, 0) /
            Math.max(1, allCriteria.length)
        );

    const allChecksPassed =
      // Ensure total health is not 0 and...
      totalHealth > 0 &&
      // Any binary checks have not failed and...
      checklistValues.every(({status}) => status !== HealthChecklistValues.FAILED) &&
      // All percentage score values are above at least the warning level.
      scoreValues.every(({health, thresholds}) => health >= thresholds.warning);

    return {
      checklist,
      health: calculatedScores,
      total: totalHealth,
      isOK: allChecksPassed,
      isDone: journeyIsConcluded,
    };
  }, [journey, state.language]);

  return journeyHealth;
};
