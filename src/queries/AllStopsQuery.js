import React, {useRef} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";

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

const AllStopsQuery = ({children, date}) => {
  const prevResults = useRef([]);

  return (
    <Query query={allStopsQuery} variables={{date}}>
      {({loading, error, data}) => {
        if (loading || !data) {
          return children({
            loading,
            error,
            stops: prevResults.current,
          });
        }

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
