export function intval(val = 0) {
  return typeof val === "string"
    ? !val
      ? 0
      : parseInt(val.replace(/\D/g, ""), 10)
    : val;
}

export function isBefore(value, otherValue) {
  const checkVal = intval(value);
  const otherVal = intval(otherValue);
  return checkVal <= otherVal;
}

export function isAfter(value, otherValue) {
  const checkVal = intval(value);
  const otherVal = intval(otherValue);
  return checkVal >= otherVal;
}

export function isWithinRange(value, rangeStart, rangeEnd) {
  return isAfter(value, rangeStart) && isBefore(value, rangeEnd);
}
