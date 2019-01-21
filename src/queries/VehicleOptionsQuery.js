import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {setUpdateListener} from "../stores/UpdateManager";

// TODO: Remove other where clauses than oday.

const vehiclesQuery = gql`
  query vehiclesQuery($date: date) {
    vehicles(
      distinct_on: [unique_vehicle_id]
      order_by: [{unique_vehicle_id: asc}]
      where: {oday: {_eq: $date}, geohash_level: {_eq: 1}}
    ) {
      unique_vehicle_id
      vehicle_number
      owner_operator_id
    }
  }
`;

const updateListenerName = "vehicle options query";

export default ({children, date}) => (
  <Query query={vehiclesQuery} variables={{date}}>
    {({loading, error, data, refetch}) => {
      setUpdateListener(updateListenerName, refetch, false);

      if (loading || !data) {
        return children({loading, error, vehicles: []});
      }

      const vehicles = get(data, "vehicles", []);

      return children({
        loading,
        error,
        vehicles,
      });
    }}
  </Query>
);