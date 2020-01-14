import React, {useRef} from "react";
import gql from "graphql-tag";
import {Query} from "@apollo/react-components";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import {useRefetch} from "../hooks/useRefetch";

const vehiclesQuery = gql`
  query vehicleOptionsQuery($date: Date, $search: String) {
    equipment(date: $date, filter: {search: $search}) {
      age
      id
      inService
      vehicleId
      operatorId
      operatorName
      registryNr
      exteriorColor
      emissionClass
      emissionDesc
      type
    }
  }
`;

const updateListenerName = "vehicle options query";

export default observer(({children, date, skip}) => {
  const prevResults = useRef([]);
  const activateRefetch = useRefetch(updateListenerName, {date, skip});

  return (
    <Query query={vehiclesQuery} variables={{date}} skip={skip}>
      {({loading, error, data, refetch}) => {
        if (loading || !data) {
          return children({
            loading,
            error,
            vehicles: prevResults.current,
          });
        }

        activateRefetch(refetch);

        const vehicles = [...get(data, "equipment", [])];
        prevResults.current = vehicles;

        return children({
          loading: loading,
          error,
          vehicles,
        });
      }}
    </Query>
  );
});
