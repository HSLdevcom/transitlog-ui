import get from "lodash/get";
import moment from "moment-timezone";
import {getAdjustedDepartureDate} from "./getAdjustedDepartureDate";
import {secondsToTimeObject} from "./time";
import {TIMEZONE} from "../constants";

export function diffDepartureJourney(journey, departure, date, useArrival = false) {
  const receivedAt = get(journey, "received_at", null);

  if (!receivedAt) {
    return null;
  }

  const observedDepartureTime = moment.tz(receivedAt, TIMEZONE);
  const plannedDepartureTime = getAdjustedDepartureDate(departure, date, useArrival);

  const diff = observedDepartureTime.diff(plannedDepartureTime, "seconds");

  // TODO: verify that the change in diff direction works

  const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
  const {seconds, minutes, hours} = secondsToTimeObject(diff);

  return {
    diff,
    hours,
    minutes,
    seconds,
    sign,
    observedMoment: observedDepartureTime,
    plannedMoment: plannedDepartureTime,
  };
}
