import {useMemo} from "react";
import last from "lodash/last";
import get from "lodash/get";
import flow from "lodash/flow";
import findLast from "lodash/findLast";
import differenceBy from "lodash/differenceBy";
import {inject} from "../helpers/inject";
import {observer} from "mobx-react-lite";
import {map} from "leaflet/dist/leaflet-src.esm";

function timeRangeFromEvents(events) {
  const firstEvent = events[0];
  const lastEvent = last(events);

  const firstTime = get(firstEvent, "recordedAtUnix", 0);
  const lastTime = get(lastEvent, "recordedAtUnix", 0);

  return [{time: firstTime, event: firstEvent}, {time: lastTime, event: lastEvent}];
}

const MAX_TIME_DIFF = 300;

const matchLiveEvents = (time, journeys) => {
  return journeys.reduce((journeysMap, journey) => {
    const lastEvent = findLast(journey.vehiclePositions, (event) => {
      if (!event.lat || !event.lng) {
        return false;
      }

      const eventTime = event.recordedAtUnix;
      return Math.abs(time - eventTime) <= MAX_TIME_DIFF;
    });

    journeysMap.set(journey.id, lastEvent);
    return journeysMap;
  }, new Map());
};

// Precisely match the current time to an event. If defaultToEnds is true, the first or last
// event will be picked when the time is out of range.
const matchEventToTime = (time, events, defaultToEnds = true) => {
  let i = 0;
  let checkSeconds = time;

  if (defaultToEnds) {
    const [
      {time: firstTime, event: firstEvent},
      {time: lastTime, event: lastEvent},
    ] = timeRangeFromEvents(events);

    if (firstTime > time) {
      // Return the first event if it it is later than the current time.
      return firstEvent;
    } else if (lastTime < time) {
      // Return the last event if it is before the current time.
      return lastEvent;
    }
  }

  let alternate = last(events).recordedAtUnix > time;

  // Max iterations is the maximum amount of seconds an event can differ from the current time.
  while (i <= MAX_TIME_DIFF) {
    if (alternate) {
      // Alternately check after (even i) and before (odd i) time
      if (i % 2 === 0) {
        checkSeconds = time + Math.round(i / 2);
      } else {
        checkSeconds = time - Math.round(i / 2);
      }
    } else {
      checkSeconds = time - i;
    }

    for (let e = events.length; e > 0; e--) {
      const event = events[e];

      if (
        event &&
        event.lat &&
        event.lng &&
        Math.abs(checkSeconds - event.recordedAtUnix) <= 2
      ) {
        return event;
      }
    }

    i++;
  }

  return null;
};

const getIndexedEvents = (time, timeIndex, journeys) => {
  if (journeys.length === 0) {
    return new Map();
  }

  let testTime = time;
  let journeysForTime;

  // Check the previous 10 seconds for matching events
  while (!journeysForTime && testTime > time - 10) {
    journeysForTime = timeIndex.get(testTime);
    testTime--;
  }

  if (!journeysForTime) {
    journeysForTime = new Map();
  }

  const indexedJourneys = Array.from(journeysForTime.keys());

  const unindexedJourneys = differenceBy(journeys, indexedJourneys, (journeyOrId) =>
    typeof journeyOrId.id === "string"
      ? journeyOrId.id
      : typeof journeyOrId === "string"
      ? journeyOrId
      : ""
  );

  if (unindexedJourneys.length !== 0) {
    for (const journey of unindexedJourneys) {
      const events = journey.vehiclePositions || [];

      if (
        get(events, "[0].recordedAtUnix", 0) > time ||
        get(events, `[${events.length - 1}].recordedAtUnix`, 0) < time
      ) {
        continue;
      }

      const nextEvent = matchEventToTime(time, events, journeys.length === 1);

      if (nextEvent) {
        journeysForTime.set(journey.id, nextEvent);
      }
    }
  }

  return journeysForTime;
};

const decorate = flow(
  observer,
  inject("state")
);

const JourneyPosition = decorate(({journeys, state, children}) => {
  const timeIndex = useMemo(() => {
    const nextTimeIndex = new Map();

    for (const journey of journeys) {
      const journeyId = journey.id;

      for (const event of journey.vehiclePositions) {
        if (!event.lat || !event.lng) {
          continue;
        }

        const ts = event.recordedAtUnix;
        const timeKeyEvents = nextTimeIndex.get(ts) || new Map();
        timeKeyEvents.set(journeyId, event);
        nextTimeIndex.set(ts, timeKeyEvents);
      }
    }

    return nextTimeIndex;
  }, [journeys, state.date]);

  // Matches the current time with an event for each journey. If live mode is activated,
  // the matching can be made slightly less expensive.
  const journeyEvents = useMemo(() => {
    const {unixTime, isLiveAndCurrent} = state;

    if (isLiveAndCurrent) {
      return matchLiveEvents(unixTime, journeys);
    } else {
      return getIndexedEvents(unixTime, timeIndex, journeys);
    }
  }, [timeIndex, state.unixTime, state.isLiveAndCurrent]);

  return children(journeyEvents);
});

export default JourneyPosition;
