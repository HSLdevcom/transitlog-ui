import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";
import React from "react";

export const vehicleTypeQuery = gql`
  query vehicleInfo($vehicleId: String, $operatorId: String) {
    allEquipment(condition: {vehicleId: $vehicleId, operatorId: $operatorId}) {
      nodes {
        vehicleId
        operatorId
        registryNr
        age
        type
        multiAxle
        exteriorColor
        class
        emissionDesc
        emissionClass
      }
    }
  }
`;

export default ({vehicleId, operatorId, skip = false, children}) => {
  return (
    <Query query={vehicleTypeQuery} variables={{vehicleId, operatorId}} skip={skip}>
      {({data, loading, error}) => {
        if (error) {
          console.error(error);
        }

        if (loading || error) children({vehicle: null, loading});

        const vehicle = get(data, "allEquipment.nodes[0]", null);

        if (!vehicle) {
          return children({vehicle: null, loading});
        }

        return children({vehicle, loading});
      }}
    </Query>
  );
};
