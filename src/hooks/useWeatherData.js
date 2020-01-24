import {useRef, useMemo} from "react";
import get from "lodash/get";
import meanBy from "lodash/meanBy";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import groupBy from "lodash/groupBy";
import {text} from "../helpers/text";
import {intval} from "../helpers/isWithinRange";

function getValues(locations, value) {
  const timeValues = locations.reduce((values, {data}) => {
    const timeValuePairs = get(data, `${value}.timeValuePairs`, []).filter(
      ({value}) => !isNaN(value)
    );

    return [...values, ...timeValuePairs];
  }, []);

  return orderBy(
    Object.entries(groupBy(timeValues, "time")).map(([time, values]) => {
      return {time, value: meanBy(values, "value")};
    }),
    "time"
  );
}

export function getClosestTimeValue(values, timestamp) {
  let prevClosest = 0;
  let selected = values[0];

  for (const value of values) {
    const {time} = value;
    const diff = Math.abs(timestamp * 1000 - time);

    if (!prevClosest || diff < prevClosest) {
      selected = value;
      prevClosest = diff;

      if (diff < 10) {
        break;
      }
    }
  }

  return selected;
}

export function getAverageValue(locations, value) {
  const timeValues = getValues(locations, value);
  const average = meanBy(timeValues, "value");
  return isNaN(average) ? false : average;
}

export function getTimeValue(timestamp, locations, value) {
  const timeValues = getValues(locations, value);
  const timeValue = getClosestTimeValue(timeValues, timestamp);
  return get(timeValue, "value", false);
}

function getMajorityValue(values) {
  const countedValues = values.reduce((valueGroups, {value}) => {
    const roundedValue = Math.round(value);

    if (!get(valueGroups, roundedValue + "")) {
      valueGroups[roundedValue] = 1;
    } else {
      valueGroups[roundedValue] += 1;
    }

    return valueGroups;
  }, {});

  const countedEntries = Object.entries(countedValues);
  const orderedValues = orderBy(
    countedEntries,
    [([, count]) => count, ([value]) => value],
    ["desc", "desc"]
  );

  return intval(get(orderedValues, "[0][0]", get(values, "[0].value", 0)));
}

// These will be translated
const roadConditionStatus = {
  "1": "dry",
  "2": "damp",
  "3": "wet",
  "4": "wet-salted",
  "5": "frost",
  "6": "snow",
  "7": "ice",
  "8": "damp-salted",
  "9": "ice-slush",
};

export function getRoadStatus(locations, timestamp, calculateAverage = false) {
  let timeValues = getValues(locations, "rscst");
  let status = {value: 1};

  if (calculateAverage) {
    const roadConditionTimeGroups = groupBy(timeValues, "time");

    timeValues = Object.entries(roadConditionTimeGroups).map(
      ([timestamp, conditionGroup]) => {
        const majorityValue = getMajorityValue(conditionGroup);
        return {time: parseInt(timestamp, 10), value: majorityValue};
      }
    );
  }

  if (timestamp) {
    status = getClosestTimeValue(timeValues, timestamp);
  } else {
    status = orderBy(uniqBy(timeValues, "value"), "value", "desc")[0];
  }

  const statusValue = Math.round(Math.min(get(status, "value", 1), 9));
  const conditionStatusTerm = get(roadConditionStatus, `${statusValue}`, "unknown");

  return text(`roadcondition.${conditionStatusTerm}`);
}

export const useWeatherData = (weatherData, timestamp) => {
  const prevData = useRef({});

  return useMemo(() => {
    const {weather, roadCondition} = weatherData || {};

    const weatherLocations = get(weather, "locations", []);
    const roadConditionLocations = get(roadCondition, "locations", []);

    const areaTemperature = timestamp
      ? getTimeValue(timestamp, weatherLocations, "t2m")
      : getAverageValue(weatherLocations, "t2m");

    const roadStatus = getRoadStatus(roadConditionLocations, timestamp, true);

    const temperature =
      areaTemperature !== false
        ? Math.round(areaTemperature * 10) / 10
        : get(prevData, "current.weather", false);

    const roadStatusTerm = roadStatus || get(prevData, "current.roadStatus", "");

    if (temperature !== false) {
      prevData.current.weather = temperature;
    }

    if (roadStatusTerm) {
      prevData.current.roadStatus = roadStatusTerm;
    }

    return {
      temperature,
      roadCondition: roadStatusTerm,
      temperatureIsUncertain: weatherLocations.length === 0,
      roadConditionIsUncertain: roadConditionLocations.length === 0,
    };
  }, [weatherData, timestamp]);
};
