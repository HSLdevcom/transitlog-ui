import get from "lodash/get";
import moment from "moment-timezone";
import {getAdjustedDepartureDate} from "./getAdjustedDepartureDate";
import {secondsToTimeObject} from "./time";

export function diffDepartureJourney(journey, departure, date, useArrival = false) {
  const receivedAt = get(journey, "received_at", null);

  if (!receivedAt) {
    return null;
  }

  const observedDepartureTime = moment.tz(receivedAt, "Europe/Helsinki");
  const plannedDepartureTime = getAdjustedDepartureDate(departure, date, useArrival);

  const diff = plannedDepartureTime.diff(observedDepartureTime, "seconds");

  const sign = diff < 0 ? "+" : diff > 0 ? "-" : "";
  const {seconds, minutes} = secondsToTimeObject(diff);

  return {
    diff,
    minutes,
    seconds,
    sign,
    observedMoment: observedDepartureTime,
    plannedMoment: plannedDepartureTime,
  };
}
