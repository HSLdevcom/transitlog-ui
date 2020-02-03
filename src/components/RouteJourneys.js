import React from "react";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";
import RouteJourneysQuery from "../queries/RouteJourneysQuery";

const decorate = flow(observer, inject("state"));

const RouteJourneys = decorate(({children, state}) => {
  const {selectedJourney, route, date} = state;

  // Hide fetched selected journey HFP if the route is not selected
  const shouldSkip = !!selectedJourney || !route || !route.routeId;

  return (
    <RouteJourneysQuery
      skip={shouldSkip}
      routeId={route.routeId}
      direction={route.direction}
      date={date}>
      {children}
    </RouteJourneysQuery>
  );
});

export default RouteJourneys;
