import findLast from "lodash/findLast";
import get from "lodash/get";
import last from "lodash/last";
import groupBy from "lodash/groupBy";
import difference from "lodash/difference";
import {round} from "../helpers/getRoundedBbox";

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

function checkDriverEventsHealth(events, incrementHealth, addMessage) {
  if (events.some((evt) => evt.type === "VJA")) {
    incrementHealth(100);
  } else {
    addMessage("No VJA event found.");
  }

  if (events.some((evt) => evt.type === "VJOUT")) {
    incrementHealth(100);
  } else {
    addMessage("No VJOUT event found.");
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

  if (!stopEvents || !stopEventsLength) {
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
  if (!journey) {
    return null;
  }

  const {stopEvents, events} = journey.events.reduce(
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

  const vehiclePositions = get(journey, "vehiclePositions", []);
  const plannedDepartures = get(journey, "routeDepartures", []);

  const maxDrivenStop = get(findLast(vehiclePositions, (pos) => !!pos.stop), "stop", "");
  const stopsVisitedCount = plannedDepartures.findIndex(
    (dep) => dep.stopId === maxDrivenStop
  );

  const visitedStops = plannedDepartures.slice(0, stopsVisitedCount);

  const healthScores = {
    stops: {health: 0, max: stopsVisitedCount * 4, messages: []},
    driver: {health: 0, max: 200, messages: []},
    positions: {health: 0, max: vehiclePositions.length, messages: []},
  };

  const onIncrementHealth = (which) => (addPoints = 0) => {
    healthScores[which].health += addPoints;
  };

  const checklist = {
    firstStopDeparture: HealthChecklistValues.PENDING,
    lastStopArrival: HealthChecklistValues.PENDING,
    timingStopDepartures: HealthChecklistValues.PENDING,
    GPS: HealthChecklistValues.PENDING,
    doors: HealthChecklistValues.PENDING,
  };

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

  checkDriverEventsHealth(events, onIncrementHealth("driver"), onAddMessage("driver"));

  checkDoorEventsHealth(events, onChecklistChange("doors"));
  checkFirstStopDeparture(events, visitedStops, onChecklistChange("firstStopDeparture"));
  checkGPS(vehiclePositions, onChecklistChange("GPS"));

  // Keep these pending until the journey is complete
  if (visitedStops.length === plannedDepartures.length) {
    checkLastStopArrival(
      events,
      get(last(plannedDepartures), "stopId"),
      onChecklistChange("lastStopArrival")
    );

    checkTimingStopDepartures(
      events,
      plannedDepartures,
      onChecklistChange("timingStopDepartures")
    );
  }

  const calculatedScores = Object.entries(healthScores).reduce(
    (categories, [name, values]) => {
      const healthScore = round((values.health / values.max) * 100);
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
    : round(allCriteria.reduce((total, val) => total + val, 0) / allCriteria.length);

  return {
    checklist,
    health: calculatedScores,
    total: totalHealth,
  };
};
