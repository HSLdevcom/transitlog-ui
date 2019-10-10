import React, {useCallback, useState, useEffect} from "react";
import {observer} from "mobx-react-lite";
import AreaJourneysQuery from "../queries/AreaJourneysQuery";
import flow from "lodash/flow";
import {setResetListener} from "../stores/FilterStore";
import {inject} from "../helpers/inject";
import {setUpdateListener} from "../stores/UpdateManager";
import {getMomentFromDateTime} from "../helpers/time";

const decorate = flow(
  observer,
  inject("state")
);

const updateListenerName = "area hfp query";

const AreaJourneys = decorate((props) => {
  const {children, skip, state} = props;
  const {
    isLiveAndCurrent,
    areaSearchRangeMinutes = "",
    time,
    date,
    areaEventsBounds,
  } = state;

  const [minTime, setMinTime] = useState(null);
  const [maxTime, setMaxTime] = useState(null);
  const [queryBbox, setQueryBbox] = useState(null);
  const [queryDate, setQueryDate] = useState(null);

  const resetAreaQuery = useCallback(() => {
    setMinTime(null);
    setMaxTime(null);
    setQueryBbox(null);
    setQueryDate(null);
  }, []);

  // Combine all values in a query vars object.
  useEffect(() => {
    if (!areaEventsBounds || !areaSearchRangeMinutes) {
      resetAreaQuery();
      return;
    }

    if (date === queryDate && queryBbox && minTime && maxTime) {
      return;
    }

    // Constrain search time span to 1 minute when auto-polling.
    const timespan = isLiveAndCurrent ? 0.5 : Math.round(areaSearchRangeMinutes / 2);

    const timeMoment = getMomentFromDateTime(date, time);
    const min = timeMoment.clone().subtract(timespan, "minutes");
    const max = isLiveAndCurrent
      ? timeMoment
      : timeMoment.clone().add(timespan, "minutes");

    setMinTime(min);
    setMaxTime(max);
    setQueryBbox(areaEventsBounds.toBBoxString());
    setQueryDate(date);
  }, [queryBbox, minTime, maxTime, date, queryDate, areaEventsBounds]);

  useEffect(() => setResetListener(resetAreaQuery), []);
  useEffect(() => setUpdateListener(updateListenerName, resetAreaQuery), []);

  return (
    <AreaJourneysQuery
      skip={!minTime || !maxTime || !queryBbox || !queryDate || skip} // Skip query if some params are falsy
      minTime={minTime}
      maxTime={maxTime}
      date={queryDate}
      bbox={queryBbox}>
      {children}
    </AreaJourneysQuery>
  );
});

export default AreaJourneys;
