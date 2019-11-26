import React, {useRef} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {useRefetch} from "../hooks/useRefetch";

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
  const activateRefetch = useRefetch(updateListenerName, {date});

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

        activateRefetch(refetch);

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
