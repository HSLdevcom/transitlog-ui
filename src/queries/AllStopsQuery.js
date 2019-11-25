import React, {useRef, useCallback} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {setUpdateListener} from "../stores/UpdateManager";

export const allStopsQuery = gql`
  query allStopsQuery($date: Date, $search: String) {
    stops(date: $date, filter: {search: $search}) {
      id
      stopId
      shortId
      lat
      lng
      name
      radius
      modes
      routes {
        routeId
        direction
        isTimingStop
        originStopId
        mode
      }
    }
  }
`;

const updateListenerName = "update plain stops";

const AllStopsQuery = ({children, date}) => {
  const prevResults = useRef([]);

  const createRefetcher = useCallback(
    (refetch) => () => {
      if (refetch && date) {
        refetch({
          date,
          _cache: false,
        });
      }
    },
    [date]
  );

  return (
    <Query query={allStopsQuery} variables={{date}}>
      {({loading, error, data, refetch}) => {
        if (loading || !data) {
          return children({
            loading,
            error,
            stops: prevResults.current,
          });
        }

        setUpdateListener(updateListenerName, createRefetcher(refetch), false);

        const stops = get(data, "stops", []);
        prevResults.current = stops;

        return children({
          loading,
          error,
          stops,
        });
      }}
    </Query>
  );
};

export default AllStopsQuery;
