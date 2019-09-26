import React, {useCallback, useState, useMemo, useEffect} from "react";
import {observer} from "mobx-react-lite";
import AreaJourneysQuery from "../queries/AreaJourneysQuery";
import invoke from "lodash/invoke";
import flow from "lodash/flow";
import {setResetListener} from "../stores/FilterStore";
import {TIMEZONE} from "../constants";
import {inject} from "../helpers/inject";
import moment from "moment-timezone";
import {setUpdateListener} from "../stores/UpdateManager";

const decorate = flow(
  observer,
  inject("state")
);

const updateListenerName = "area hfp query";

const AreaJourneys = decorate((props) => {
  const {children, skip, state} = props;
  const {isLiveAndCurrent, areaSearchRangeMinutes, unixTime, date} = state;

  const [queryBounds, setQueryBounds] = useState(null);
  const [queryRange, setQueryRange] = useState(null);
  const [areaLoading, setAreaLoading] = useState(false);

  const resetAreaQuery = useCallback(() => {
    setQueryRange(null);
    setQueryBounds(null);
  }, []);

  const createAreaQuery = useCallback(
    (bounds, time) => {
      if (bounds) {
        const queryTime = moment.unix(time).tz(TIMEZONE);
        // Constrain search time span to 1 minute when auto-polling.
        const timespan = isLiveAndCurrent ? 0.5 : Math.round(areaSearchRangeMinutes / 2);

        const min = queryTime.clone().subtract(timespan, "minutes");
        const max = isLiveAndCurrent
          ? queryTime
          : queryTime.clone().add(timespan, "minutes");

        const range = {min, max};

        setQueryRange(range);
        setQueryBounds(bounds);
      }
    },
    [isLiveAndCurrent, areaSearchRangeMinutes]
  );

  const updateAreaQuery = useCallback(() => {
    if (!areaLoading) {
      createAreaQuery(queryBounds, unixTime);
    }
  }, [queryBounds, unixTime, isLiveAndCurrent, areaSearchRangeMinutes, areaLoading]);

  // Create an area query if the bounds are valid
  const requestArea = useCallback(
    (bounds) => {
      if (!bounds || !invoke(bounds, "isValid")) {
        setQueryBounds(null);
      }

      if (queryBounds && queryBounds.isValid() && queryBounds.equals(bounds)) {
        return;
      }

      createAreaQuery(bounds, unixTime);
    },
    [queryBounds, !queryBounds ? 0 : unixTime]
  );

  // Combine all values in a unified values object.
  const queryVars = useMemo(() => {
    if (!queryBounds || !queryRange) {
      return null;
    }

    // Translate the bounding box to a min/max query for the HFP api and create a time range.
    return {
      minTime: queryRange.min.toISOString(true),
      maxTime: queryRange.max.toISOString(true),
      bbox: queryBounds.toBBoxString(),
      date: state.date,
    };
  }, [queryBounds, queryRange, state.date]);

  useEffect(() => setResetListener(resetAreaQuery), [resetAreaQuery]);
  useEffect(() => setUpdateListener(updateListenerName, updateAreaQuery), [
    updateAreaQuery,
  ]);

  useEffect(updateAreaQuery, [date, isLiveAndCurrent]);

  return (
    <AreaJourneysQuery
      skip={!queryVars || skip} // Skip query if some params are falsy
      {...(queryVars || {})}>
      {({journeys, loading, error}) => {
        setAreaLoading(loading);

        return children({
          setQueryBounds: requestArea,
          // Query bounds may be limited in some cases. If so, put the actual bounds here:
          actualQueryBounds: queryBounds,
          journeys,
          loading,
          error,
        });
      }}
    </AreaJourneysQuery>
  );
});

export default AreaJourneys;
