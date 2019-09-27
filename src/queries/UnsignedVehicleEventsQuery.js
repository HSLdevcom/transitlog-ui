import React, {useEffect, useCallback} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";

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

const UnsignedVehicleEventsQuery = (props) => {
  const {vehicleId, date, skip, children} = props;

  const createRefetcher = useCallback(
    (refetch) => () => {
      if (!skip && vehicleId && date) {
        refetch({
          vehicleId,
          date,
        });
      }
    },
    [vehicleId, date, skip]
  );

  useEffect(() => () => removeUpdateListener(updateListenerName), []);

  return (
    <Query
      partialRefetch={true}
      skip={skip || !vehicleId || !date}
      query={unsignedEventsQuery}
      variables={{
        vehicleId,
        date,
      }}>
      {({data, loading, error, refetch}) => {
        if (!data || loading) {
          return children({unsignedEvents: [], loading, error});
        }

        setUpdateListener(updateListenerName, createRefetcher(refetch), false);
        const unsignedEvents = get(data, "unsignedVehicleEvents", []);
        return children({unsignedEvents, loading, error});
      }}
    </Query>
  );
};

export default UnsignedVehicleEventsQuery;
