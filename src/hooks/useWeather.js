import {useState, useEffect, useRef, useMemo, useCallback} from "react";
import moment from "moment-timezone";
import {getWeatherForArea} from "../helpers/getWeatherForArea";
import {getRoadConditionsForArea} from "../helpers/getRoadConditionsForArea";
import {floorMoment, ceilMoment} from "../helpers/roundMoment";
import {LatLngBounds, latLngBounds} from "leaflet";
import difference from "lodash/difference";
import {TIMEZONE} from "../constants";
import {getRoundedBbox} from "../helpers/getRoundedBbox";
import isValid from "date-fns/isValid";

import {legacyParse} from "@date-fns/upgrade/v2";
import {useDebouncedCallback} from "use-debounce";

export function getWeatherSamplePoint(location) {
  let validPoint = location || null;

  if (location instanceof LatLngBounds) {
    validPoint = location.getCenter();
  }

  return validPoint;
}

const hslBBox = getRoundedBbox(
  latLngBounds([
    [59.974192356660275, 23.80462646484375],
    [60.67707371703147, 25.749206542968754],
  ])
).toBBoxString();

const allSites = [
  "100971",
  "101004",
  "101009",
  "151028",
  "103943",
  "852678",
  "874863",
  "100976",
  "100968",
  "100974",
  "100974",
  "103786",
];

export const useWeather = (endTime, startTime = null) => {
  // Collect cancellation callbacks and use one function to run them all.
  const cancelCallbacks = useRef([]);
  const onCancel = useCallback(
    (cancelType) => {
      const called = [];

      cancelCallbacks.current
        .filter(({type}) => cancelType === type)
        .forEach((cancelCallback) => {
          cancelCallback.func();
          called.push(cancelCallback);
        });

      cancelCallbacks.current = difference(cancelCallbacks.current, called);
    },
    [cancelCallbacks.current]
  );

  // Record the fetched weather and road data
  const [weatherData, setWeatherData] = useState(null);
  const [roadData, setRoadData] = useState(null);
  const weatherLoading = useRef(false);
  const roadLoading = useRef(false);

  // Metolib cannot cache if we use a bbox, so map all locations, points or bboxes
  // supplied to this hook to sites that can be cached by metolib.
  let sites = allSites;

  const [queryStartTime, queryEndTime] = useMemo(() => {
    // Get the base date that is used in the weather request. Also ensure the date
    // isn't further in the future from the real world time.
    const endDate = moment.min(
      ceilMoment(moment.tz(endTime, TIMEZONE), 10, "minutes"),
      floorMoment(moment.tz(), 10, "minutes")
    );

    // Get a nice startDate by flooring the time to the nearest 10 minute mark.
    const startDate = floorMoment(
      startTime
        ? moment.tz(startTime, TIMEZONE)
        : endDate.clone().subtract(10, "minutes"),
      10,
      "minutes"
    );

    return [startDate.toDate(), endDate.toDate()];
  }, [endTime, startTime]);

  const [debouncedFetchWeather] = useDebouncedCallback(
    (sites, queryStart, queryEnd, onData) => {
      // If we got to here, a new weather request will be made.
      weatherLoading.current = true;

      // Start the requests. Each promise returns an object containing
      // the data and request namespace.
      getWeatherForArea(sites, queryStart, queryEnd, (cancelCb) =>
        cancelCallbacks.current.push({type: "weather", func: cancelCb})
      )
        .then(onData)
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          weatherLoading.current = false;
        });
    },
    1000
  );

  const [debouncedFetchRoad] = useDebouncedCallback((queryStart, queryEnd, onData) => {
    // If we got to here, a new weather request will be made.
    roadLoading.current = true;

    getRoadConditionsForArea(hslBBox, queryStartTime, queryEndTime, (cancelCb) =>
      cancelCallbacks.current.push({type: "road", func: cancelCb})
    )
      .then(onData)
      .catch((err) => console.error(err))
      .finally(() => (roadLoading.current = false));
  });

  useEffect(() => {
    // Bail directly if it is loading or we don't have all the data we need yet.
    if (
      weatherLoading.current ||
      !sites ||
      (!queryStartTime || !isValid(legacyParse(queryStartTime))) ||
      (!queryEndTime || !isValid(legacyParse(queryEndTime)))
    ) {
      return () => {};
    }

    let cancelled = false;

    const onFetchedData = (data) => {
      if (!cancelled) {
        setWeatherData(data);
      }
    };

    debouncedFetchWeather(sites, queryStartTime, queryEndTime, onFetchedData);

    return () => {
      cancelled = true;
      weatherLoading.current = false;
      onCancel("weather");
    }; // The effect will cancel the connections if refreshed (or unmounted).
  }, [queryStartTime, queryEndTime, sites]); // Only refresh the effect if these props change.

  useEffect(() => {
    // Bail directly if it is loading or we don't have all the data we need yet.
    if (
      roadLoading.current ||
      (!queryStartTime || !isValid(legacyParse(queryStartTime))) ||
      (!queryEndTime || !isValid(legacyParse(queryEndTime)))
    ) {
      return () => {};
    }

    let cancelled = false;

    const onFetchedData = (data) => {
      if (!cancelled) {
        setRoadData(data);
      }
    };

    debouncedFetchRoad(queryStartTime, queryEndTime, onFetchedData);

    return () => {
      cancelled = true;
      roadLoading.current = false;
      onCancel("road");
    };
  }, [queryStartTime.valueOf(), queryEndTime.valueOf()]);

  const combinedData = useMemo(
    () => ({
      weather: weatherData,
      roadCondition: roadData,
    }),
    [weatherData, roadData]
  );

  return [combinedData];
};
