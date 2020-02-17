function getDelayType(delay, strict = false) {
  if (!delay && delay !== 0) {
    // Return empty string if falsy but not zero, which is a valid value.
    return "";
  }

  const earlyThreshold = !strict ? -10 : 0;
  return delay <= earlyThreshold ? "early" : delay >= 60 * 3 ? "late" : "on-time";
}

export default getDelayType;
