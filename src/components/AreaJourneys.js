import React, {useCallback, useState, useEffect} from "react";
import {observer} from "mobx-react-lite";
import AreaJourneysQuery from "../queries/AreaJourneysQuery";
import flow from "lodash/flow";
import {setResetListener} from "../stores/FilterStore";
import {inject} from "../helpers/inject";
import {setUpdateListener} from "../stores/UpdateManager";
import {getMomentFromDateTime} from "../helpers/time";
import get from "lodash/get";

const decorate = flow(observer, inject("state"));

const updateListenerName = "area hfp query";

const AreaJourneys = decorate((props) => {
  const {children, skip, state} = props;

  const {
    isLiveAndCurrent,
    areaSearchRangeMinutes = "",
    time,
    date,
    selectedBounds,
    areaEventsRouteFilter,
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
    if (!selectedBounds || !areaSearchRangeMinutes) {
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
    setQueryBbox(selectedBounds.toBBoxString());
    setQueryDate(date);
  }, [queryBbox, minTime, maxTime, date, queryDate, selectedBounds]);

  useEffect(() => setResetListener(resetAreaQuery), []);
  useEffect(() => setUpdateListener(updateListenerName, resetAreaQuery), []);

  return (
    <AreaJourneysQuery
      skip={!minTime || !maxTime || !queryBbox || !queryDate || skip} // Skip query if some params are falsy
      minTime={minTime}
      maxTime={maxTime}
      date={queryDate}
      bbox={queryBbox}>
      {({journeys = [], loading}) => {
        let areaJourneys = journeys;

        if (areaEventsRouteFilter) {
          const routes = areaEventsRouteFilter.split(",").map((r) => r.trim());

          areaJourneys = areaJourneys.filter((route) => {
            if (!get(route, "routeId", null)) {
              return routes.some((r) => r === "signoff");
            }

            return routes.some((r) => route.routeId.includes(r));
          });
        }

        return children({journeys: areaJourneys, loading});
      }}
    </AreaJourneysQuery>
  );
});

export default AreaJourneys;
