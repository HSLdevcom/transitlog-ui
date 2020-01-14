import React, {useRef, useMemo} from "react";
import gql from "graphql-tag";
import {Query} from "@apollo/react-components";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import {useRefetch} from "../hooks/useRefetch";

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

const updateListenerName = "route stops query";

export default observer(({children, route, date, skip}) => {
  const prevResult = useRef([]);

  const queryProps = useMemo(
    () => ({
      routeId: get(route, "routeId"),
      direction: get(route, "direction"),
      date,
    }),
    [route, date]
  );

  const activateRefetch = useRefetch(updateListenerName, {...queryProps, skip});

  return (
    <Query skip={skip} query={stopsByRouteQuery} variables={queryProps}>
      {({loading, error, data, refetch}) => {
        if (loading || error || !data) {
          return children({
            loading,
            error,
            stops: prevResult.current,
          });
        }

        activateRefetch(refetch);

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
