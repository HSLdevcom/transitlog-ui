import React, {useEffect, useCallback} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {observer} from "mobx-react-lite";
import {useRefetch} from "../hooks/useRefetch";
import query from "apollo-cache-inmemory/lib/fragmentMatcherIntrospectionQuery";

export const unsignedEventsQuery = gql`
  query unsignedEventsQuery($date: Date!, $vehicleId: VehicleId!) {
    unsignedVehicleEvents(date: $date, uniqueVehicleId: $vehicleId) {
      id
      journeyType
      doorStatus
      heading
      lat
      lng
      operatorId
      recordedAt
      recordedAtUnix
      recordedTime
      uniqueVehicleId
      vehicleId
      velocity
      mode
    }
  }
`;

const updateListenerName = "unsigned vehicle events";

const UnsignedVehicleEventsQuery = observer((props) => {
  const {vehicleId, date, skip, children} = props;

  const queryProps = {
    vehicleId,
    date,
  };

  const activateRefetch = useRefetch(updateListenerName, {...queryProps, skip});

  return (
    <Query
      partialRefetch={true}
      skip={skip}
      query={unsignedEventsQuery}
      variables={queryProps}>
      {({data, loading, error, refetch}) => {
        if (!data || loading) {
          return children({unsignedEvents: [], loading, error});
        }

        activateRefetch(refetch);

        const unsignedEvents = get(data, "unsignedVehicleEvents", []);
        return children({unsignedEvents, loading, error});
      }}
    </Query>
  );
});

export default UnsignedVehicleEventsQuery;
