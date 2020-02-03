import {useMemo} from "react";

export const useCurrentEvent = (events, unixTime) => {
  const currentEvent = useMemo(() => {
    if (!events || events.length === 0 || !unixTime) {
      return null;
    }

    let event = null;
    let currentTimeDiff = 60;

    for (const evt of events) {
      if (!evt.recordedAtUnix) {
        continue;
      }

      const timeDiff = Math.abs(unixTime - evt.recordedAtUnix);

      if (timeDiff < currentTimeDiff) {
        event = evt;
        currentTimeDiff = timeDiff;
      }

      if (currentTimeDiff < 5) {
        break;
      }
    }

    return event;
  }, [events, unixTime]);

  return currentEvent;
};
