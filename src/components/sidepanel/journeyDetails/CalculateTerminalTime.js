import get from "lodash/get";
import moment from "moment-timezone";
import {secondsToTimeObject} from "../../../helpers/time";
import {TIMEZONE} from "../../../constants";
import {useMemo} from "react";

// Reusable higher-order function for calculating the planned arrival time from
// the departure time and the terminal time for the first stop of a route.

export default function CalculateTerminalTime({
  event,
  departure,
  recovery = false,
  children,
}) {
  const observedTime = useMemo(() => moment.tz(event.recordedAt, TIMEZONE), [event]);
  const plannedTime = useMemo(() => moment.tz(event.plannedDateTime, TIMEZONE), [event]);

  const bufferTime = get(departure, recovery ? "recoveryTime" : "terminalTime", 0);

  const diff = useMemo(() => observedTime.diff(plannedTime, "seconds"), [
    observedTime,
    plannedTime,
  ]);

  const sign = diff < 0 ? "-" : diff > 0 ? "+" : "";

  const {
    hours: diffHours = 0,
    seconds: diffSeconds = 0,
    minutes: diffMinutes = 0,
  } = secondsToTimeObject(Math.abs(diff));

  let wasLate;
  let offsetTime;

  if (recovery) {
    wasLate = diff < 0 ? false : diff > bufferTime * 60;
    offsetTime = plannedTime;
  } else {
    wasLate = diff > -(bufferTime * 60);
    offsetTime = plannedTime.clone().subtract(bufferTime, "minutes");
  }

  return children({
    offsetTime,
    wasLate,
    diffHours,
    diffMinutes,
    diffSeconds,
    sign,
    diff,
  });
}
