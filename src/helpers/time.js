import moment from "moment-timezone";
import doubleDigit from "./doubleDigit";
import {
  TIMEZONE,
  TIME_SLIDER_DEFAULT_MIN,
  TIME_SLIDER_MIN,
  TIME_SLIDER_MAX,
} from "../constants";
import flatten from "lodash/flatten";
import {getTimeRangeFromEvents} from "./getTimeRangeFromEvents";

export function timeToTimeObject(timeStr = "") {
  const num = (val) => parseInt(val, 10);
  const [hours = 0, minutes = 0, seconds = 0] = (timeStr || "").split(":");

  return {
    hours: num(hours),
    minutes: num(minutes),
    seconds: num(seconds),
  };
}

export function timeToSeconds(timeStr = "") {
  const {hours = 0, minutes = 0, seconds = 0} = timeToTimeObject(timeStr);
  return seconds + minutes * 60 + hours * 60 * 60;
}

export function secondsToTimeObject(seconds) {
  const absSeconds = Math.abs(seconds);

  const totalSeconds = Math.floor(absSeconds % 60);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const hours = Math.floor(absSeconds / 60 / 60);

  return {
    hours,
    minutes,
    seconds: totalSeconds,
  };
}

export function secondsToTime(secondsDuration) {
  const {hours = 0, minutes = 0, seconds = 0} = secondsToTimeObject(secondsDuration);
  return getTimeString(hours, minutes, seconds);
}

export function getNormalTime(time = "") {
  let [hours = 0, minutes = 0, seconds = 0] = (time || "").split(":");

  if (parseInt(hours, 10) > 23) {
    hours = hours - 24;
  }

  return getTimeString(hours, minutes, seconds);
}

export function getTimeString(hours = 0, minutes = 0, seconds = 0) {
  return `${doubleDigit(hours)}:${doubleDigit(minutes)}:${doubleDigit(seconds)}`;
}

export function getMomentFromDateTime(date, time = "00:00:00", timezone = TIMEZONE) {
  // Get the seconds elapsed during the date. The time can be a 24h+ time.
  const seconds = timeToSeconds(time);
  // Create a base moment at the start of the day
  const baseDate = moment.tz(date, timezone);
  // Create a Date from the date and add the seconds.
  const nextDate = baseDate.clone().add(seconds, "seconds");

  // In Finland DST changes at 3am in the morning, so the baseDate will not be in DST but when we
  // add the seconds, moment notices that it needs to add an hour and does so. This is actually
  // not desired as then the time will be wrong as we are adding seconds. Adjust the moments back
  // if their DST states differ.
  if (nextDate.isDST() && !baseDate.isDST()) {
    nextDate.subtract(1, "hour");
  } else if (!nextDate.isDST() && baseDate.isDST()) {
    nextDate.add(1, "hour");
  }

  return nextDate;
}

export const getValidTimeWithinRange = (time, journeys = [], returnRange = false) => {
  const numericTime =
    typeof time === "string" && time.includes(":")
      ? timeToSeconds(time)
      : typeof time === "number"
      ? time
      : 0;

  let timeRange = {min: TIME_SLIDER_DEFAULT_MIN, max: TIME_SLIDER_MAX};

  if (journeys.length !== 0) {
    // Get the first and last event from each journey. This is used
    // to get the min and max time for the range slider and time input
    const eventsRange = flatten(
      journeys.map(({vehiclePositions = []}) => [
        vehiclePositions[0],
        vehiclePositions[vehiclePositions.length - 1],
      ])
    );

    const eventsTimeRange = getTimeRangeFromEvents(eventsRange);

    if (eventsTimeRange) {
      timeRange = eventsTimeRange;
    }
  }

  const {min = TIME_SLIDER_MIN, max = TIME_SLIDER_MAX} = timeRange;
  let rangeMin = min;
  let rangeMax = max;

  rangeMin = isNaN(rangeMin) ? TIME_SLIDER_MIN : rangeMin;
  rangeMax = isNaN(rangeMax) ? TIME_SLIDER_MAX : rangeMax;

  const currentValue = Math.max(Math.min(numericTime, rangeMax), rangeMin);
  const timeStr = secondsToTime(currentValue);

  if (!returnRange) {
    return timeStr;
  }

  return {
    timeValue: currentValue, // Numeric value returned if range requested.
    rangeMin: rangeMin,
    rangeMax: rangeMax,
  };
};

// Get the (potentially) 24h+ time of the journey.
// For best results, pass in the observed start time as useMoment, but if that's
// not available, use the time of the first event from this journey that you have.
export function journeyStartTime(event, useMoment) {
  if (!event || !event.journey_start_time) {
    return "";
  }

  const eventMoment = useMoment ? useMoment : moment.tz(event.tst, TIMEZONE);
  const odayMoment = getMomentFromDateTime(event.oday);
  const diff = eventMoment.diff(odayMoment, "hours");

  const [hours, minutes, seconds] = event.journey_start_time.split(":");
  let intHours = parseInt(hours, 10);

  /*
    If the eventMoment was more than a day after the operation day, we're probably
    dealing with a 24h+ journey. Also make sure that the start time hours are under 21,
    which was chosen as a time that shouldn't appear more than once in a 24h+ day.
    Thus, the maximum day length supported is 36h. After that things get weird.
    
    There must be an upper limit to intHours, otherwise times such as 23:59 get 24 hours
    added to them if the event happens after midnight. Not good.
    
    The diff check should be under 24 to also allow event times that are before the
    planned start times for journeys that teeter in the edge of midnight.
   */

  if (intHours <= 12 && Math.floor(diff) >= 23) {
    intHours = intHours + Math.max(1, Math.floor(diff / 24)) * 24;
  }

  return getTimeString(intHours, minutes, seconds);
}

export function journeyEventTime(event, date) {
  if (!event || !event.recordedAt) {
    return "";
  }

  const useDate = date || event.departureDate || event.oday;
  const recordedMoment = moment.tz(event.recordedAt, TIMEZONE);

  let hours = recordedMoment.hours();
  let minutes = recordedMoment.minutes();
  let seconds = recordedMoment.seconds();

  if (useDate !== recordedMoment.format("YYYY-MM-DD")) {
    hours = hours + 24;
  }

  return getTimeString(hours, minutes, seconds);
}

export function getDepartureMoment(departure) {
  let {isNextDay, departureTime: departureTimeStr, departureDate} = departure;

  const {hours = 0, minutes = 0} = timeToTimeObject(departureTimeStr);

  const hour = isNextDay ? hours + 24 : hours;
  const departureTime = getTimeString(hour, minutes);

  return getMomentFromDateTime(departureDate, departureTime);
}

// Return the departure time as a 24h+ time string
export function departureTime(departure, useArrival = false) {
  let {isNextDay, hours, minutes} = departure;

  if (useArrival) {
    hours = departure.arrivalHours;
    minutes = departure.arrivalMinutes;
  }

  const hour = isNextDay ? hours + 24 : hours;
  return getTimeString(hour, minutes);
}
