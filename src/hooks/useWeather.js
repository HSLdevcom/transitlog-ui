import {useState, useEffect, useRef, useMemo, useCallback} from "react";
import moment from "moment-timezone";
import {getWeatherForArea} from "../helpers/getWeatherForArea";
import {getRoadConditionsForArea} from "../helpers/getRoadConditionsForArea";
import {ceilMoment} from "../helpers/roundMoment";
import {latLngBounds} from "leaflet";
import difference from "lodash/difference";
import isValid from "date-fns/isValid";
import {useDebouncedCallback} from "use-debounce";
import {getMomentFromDateTime} from "../helpers/time";

const hslBBox = latLngBounds([
  {lat: 59.90817755736249, lng: 24.10675048828125},
  {lat: 60.813977939870355, lng: 25.7080078125},
]).toBBoxString();

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
].sort();

const results = {};

export const useWeather = (date) => {
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

  // Metolib cannot cache if we use a bbox, so map all locations, points or bboxes
  // supplied to this hook to sites that can be cached by metolib.
  let sites = allSites;

  const [queryStartTime, queryEndTime] = useMemo(() => {
    let startTime = getMomentFromDateTime(date).startOf("day");
    let endTime = startTime.clone().endOf("day");

    // Get the base date that is used in the weather request. Also ensure the date
    // isn't further in the future from the real world time.
    endTime = moment.min(endTime, ceilMoment(moment.tz(), 1, "hours"));

    return [startTime.toDate(), endTime.toDate()];
  }, [date]);

  const [debouncedFetchWeather] = useDebouncedCallback(
    (sites, queryStart, queryEnd, onData) => {
      // Start the requests. Each promise returns an object containing
      // the data and request namespace.
      getWeatherForArea(sites, queryStart, queryEnd, (cancelCb) =>
        cancelCallbacks.current.push({type: "weather", func: cancelCb})
      )
        .then(onData)
        .catch((err) => {
          console.error(err);
        });
    },
    1000
  );

  const [debouncedFetchRoad] = useDebouncedCallback((queryStart, queryEnd, onData) => {
    getRoadConditionsForArea(hslBBox, queryStartTime, queryEndTime, (cancelCb) =>
      cancelCallbacks.current.push({type: "road", func: cancelCb})
    )
      .then(onData)
      .catch((err) => console.error(err));
  });

  useEffect(() => {
    if (
      !(queryStartTime && queryEndTime) ||
      !(isValid(queryStartTime) && isValid(queryEndTime))
    ) {
      return () => {
        onCancel("weather");
        onCancel("road");
      };
    }

    let cancelled = false;

    const onFetchedWeatherData = (data) => {
      if (!cancelled) {
        setWeatherData(data);
      }
    };

    const onFetchedRoadData = (data) => {
      if (!cancelled) {
        setRoadData(data);
      }
    };

    debouncedFetchWeather(sites, queryStartTime, queryEndTime, onFetchedWeatherData);
    debouncedFetchRoad(queryStartTime, queryEndTime, onFetchedRoadData);

    return () => {
      cancelled = true;
      onCancel("weather");
      onCancel("road");
    }; // The effect will cancel the connections if refreshed (or unmounted).
  }, [queryStartTime, queryEndTime]); // Only refresh the effect if these props change.

  if (results[date]) {
    return results[date];
  }

  const weatherResult = {
    weather: weatherData,
    roadCondition: roadData,
  };

  if (weatherData && roadData) {
    results[date] = weatherResult;
  }

  return weatherResult;
};
