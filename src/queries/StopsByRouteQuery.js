import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react";
import {AlertFieldsFragment} from "./AlertFieldsFragment";

const stopsByRouteQuery = gql`
  query routeSegments($routeId: String!, $direction: Direction!, $date: Date!) {
    routeSegments(routeId: $routeId, direction: $direction, date: $date) {
      id
      routeId
      direction
      originStopId
      stopId
      shortId
      lat
      lng
      name
      radius
      modes
      destination
      distanceFromPrevious
      distanceFromStart
      duration
      stopIndex
      isTimingStop
      alerts {
        ...AlertFieldsFragment
      }
    }
  }
  ${AlertFieldsFragment}
`;

export default observer(({children, route, date, skip}) => {
  return (
    <Query
      skip={skip}
      query={stopsByRouteQuery}
      variables={{
        routeId: get(route, "routeId"),
        direction: get(route, "direction"),
        date,
      }}>
      {({loading, error, data}) => {
        const stops = get(data, "routeSegments", []);

        return children({
          loading,
          error,
          stops,
        });
      }}
    </Query>
  );
});
