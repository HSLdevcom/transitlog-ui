import get from "lodash/get";
import last from "lodash/last";
import orderBy from "lodash/orderBy";
import {timeToSeconds} from "./time";

/*
  Returns a range in seconds, relative to the operation day, for the provided array of hfp events.
  The min and max values are seconds passed since the start of the operation day.
 */

export function getTimeRangeFromEvents(events) {
  if (events.length === 0) {
    return null;
  }

  const sortedPositions = orderBy(events, "recordedAtUnix", "asc");

  // Min and max moments for the position range
  const minTime = timeToSeconds(get(sortedPositions, "[0].recordedTime"));
  const maxTime = timeToSeconds(get(last(sortedPositions), "recordedTime"));

  return {
    min: isNaN(minTime) ? undefined : minTime,
    max: isNaN(maxTime) ? undefined : maxTime,
  };
}
