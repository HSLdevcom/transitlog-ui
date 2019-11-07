import findLast from "lodash/findLast";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import difference from "lodash/difference";
import {round} from "../helpers/getRoundedBbox";

const stopEventTypes = ["DEP", "PDE", "ARR", "ARS"];

function checkDoorEventsHealth(events, incrementHealth, addMessage) {
  if (events.some((evt) => ["DOO", "DOC"].includes(evt.type))) {
    incrementHealth(100);
  } else {
    addMessage("No door events found.");
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

  for (const plannedStop of plannedStops) {
    const eventsForStop = get(eventGroups, plannedStop, []);
    incrementHealth(eventsForStop.length);

    if (eventsForStop.length < stopEventTypes.length) {
      const presentEvents = eventsForStop.map((evt) => evt.type);
      const missingEvents = difference(stopEventTypes, presentEvents);
      addMessage(`Events missing for stop ${plannedStop}: ${missingEvents.join(", ")}`);
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
  const plannedDepartures = get(journey, "routeDepartures", []).map(({stopId}) => stopId);

  const maxDrivenStop = get(findLast(vehiclePositions, (pos) => !!pos.stop), "stop", "");
  const stopsVisitedCount = plannedDepartures.indexOf(maxDrivenStop);

  const healthScores = {
    stops: {health: 0, max: stopsVisitedCount * 4},
    driver: {health: 0, max: 200},
    positions: {health: 0, max: vehiclePositions.length},
    doors: {health: 0, max: 100},
  };

  const onIncrementHealth = (which) => (addPoints = 0) => {
    healthScores[which].health += addPoints;
  };

  const messages = [];

  const onAddMessage = (message) => {
    messages.push(message);
  };

  checkPositionEventsHealth(
    vehiclePositions,
    onIncrementHealth("positions"),
    onAddMessage
  );

  checkStopEventsHealth(
    stopEvents,
    plannedDepartures.slice(0, stopsVisitedCount),
    onIncrementHealth("stops"),
    onAddMessage
  );

  checkDriverEventsHealth(events, onIncrementHealth("driver"), onAddMessage);
  checkDoorEventsHealth(events, onIncrementHealth("doors"), onAddMessage);

  const calculatedScores = Object.entries(healthScores).reduce(
    (categories, [name, values]) => {
      const healthScore = round((values.health / values.max) * 100);
      categories[name] = healthScore;
      return categories;
    },
    {}
  );

  const totalHealth = round(
    Object.values(calculatedScores).reduce((total, val) => total + val, 0) /
      Object.keys(calculatedScores).length
  );

  return {
    messages,
    health: calculatedScores,
    total: totalHealth,
  };
};
