import React, {useRef, useCallback} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import {setUpdateListener} from "../stores/UpdateManager";

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
    }
  }
`;

const updateListenerName = "update route stops";

export default observer(({children, route, date, skip}) => {
  const prevResult = useRef([]);

  const createRefetcher = useCallback(
    (refetch) => () => {
      if (refetch && route && route.routeId && date && !skip) {
        refetch({
          routeId: get(route, "routeId"),
          direction: get(route, "direction"),
          date,
          _cache: false,
        });
      }
    },
    [route, date, skip]
  );

  return (
    <Query
      skip={skip}
      query={stopsByRouteQuery}
      variables={{
        routeId: get(route, "routeId"),
        direction: get(route, "direction"),
        date,
      }}>
      {({loading, error, data, refetch}) => {
        if (loading || error || !data) {
          return children({
            loading,
            error,
            stops: prevResult.current,
          });
        }

        setUpdateListener(updateListenerName, createRefetcher(refetch), false);

        const stops = get(data, "routeSegments", []);

        if (stops && stops.length !== 0) {
          prevResult.current = stops;
        }

        return children({
          loading,
          error,
          stops,
        });
      }}
    </Query>
  );
});
