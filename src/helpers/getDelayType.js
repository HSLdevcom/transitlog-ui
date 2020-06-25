export const delayStopType = {
  TIMING: "timing",
  ORIGIN: "origin",
  DESTINATION: "destination",
  NORMAL: "normal",
};

export function getDelayStopType(event, defaultType = delayStopType.NORMAL) {
  if (event.isTimingStop) {
    return delayStopType.TIMING;
  }

  if (event.isOrigin) {
    return delayStopType.ORIGIN;
  }

  return defaultType;
}

function getDelayType(delay, stopType = delayStopType.NORMAL) {
  if (!delay && delay !== 0) {
    // Return empty string if falsy but not zero, which is a valid value.
    return "";
  }

  let earlyThreshold;

  switch (stopType) {
    case "timing":
      earlyThreshold = 0;
      break;
    case "origin":
      earlyThreshold = -20;
      break;
    case "destination":
      earlyThreshold = -10;
      break;
    default:
    case "normal":
      earlyThreshold = -10;
  }

  let earlyType = [delayStopType.NORMAL, delayStopType.DESTINATION].includes(stopType)
    ? "normal-early"
    : "early";

  return delay <= earlyThreshold ? earlyType : delay >= 60 * 3 ? "late" : "on-time";
}

export default getDelayType;
