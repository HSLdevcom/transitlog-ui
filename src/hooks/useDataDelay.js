import {useMemo} from "react";
import get from "lodash/get";
import parseISO from "date-fns/parseISO";
import differenceInMilliseconds from "date-fns/differenceInMilliseconds";

export const useDataDelay = (journey) => {
  const dataDelay = useMemo(() => {
    const journeyEvents = get(journey, "events", []);
    const vehiclePositions = get(journey, "vehiclePositions", []);

    const combinedEvents = journeyEvents.concat(vehiclePositions);
    const delays = [];

    for (const event of combinedEvents) {
      if (!event.receivedAt || !event.recordedAt) {
        continue;
      }

      const receivedAt = parseISO(event.receivedAt);
      const recordedAt = parseISO(event.recordedAt);

      const delay = differenceInMilliseconds(receivedAt, recordedAt);
      delays.push(delay);
    }

    const delaySum = delays.reduce((total, delay) => total + delay, 0);
    const delayCount = delays.length;

    return delaySum / delayCount / 1000;
  }, [journey]);

  return dataDelay;
};
