import React, {useEffect, useCallback} from "react";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import gql from "graphql-tag";
import {observer} from "mobx-react-lite";
import {Query} from "react-apollo";
import {removeUpdateListener, setUpdateListener} from "../stores/UpdateManager";
import {timeToSeconds} from "../helpers/time";
import {AlertFieldsFragment} from "./AlertFieldsFragment";

export const hfpQuery = gql`
  query vehicleJourneysQuery($date: Date!, $uniqueVehicleId: VehicleId!) {
    vehicleJourneys(date: $date, uniqueVehicleId: $uniqueVehicleId) {
      id
      journeyType
      lineId
      routeId
      direction
      originStopId
      departureDate
      departureTime
      uniqueVehicleId
      operatorId
      vehicleId
      headsign
      mode
      recordedAt
      recordedAtUnix
      recordedTime
      timeDifference
      nextStopId
      alerts {
        ...AlertFieldsFragment
      }
    }
  }
  ${AlertFieldsFragment}
`;

const updateListenerName = "vehicle hfp query";

const VehicleJourneysQuery = observer((props) => {
  const {date, vehicleId, skip, children} = props;
  let [operatorId, vehicleNumber] = vehicleId.split("/");

  operatorId = parseInt(operatorId, 10);
  vehicleNumber = parseInt(vehicleNumber, 10);

  const uniqueVehicleId = `${operatorId}/${vehicleNumber}`;

  const createRefetcher = useCallback(
    (refetch) => () => {
      if (vehicleId && !skip) {
        refetch({
          date,
          uniqueVehicleId,
        });
      }
    },
    [date, vehicleId, skip]
  );

  useEffect(() => () => removeUpdateListener(updateListenerName), []);

  return (
    <Query
      query={hfpQuery}
      variables={{
        date,
        uniqueVehicleId,
      }}>
      {({data, loading, refetch}) => {
        if (!loading) {
          setUpdateListener(updateListenerName, createRefetcher(refetch));
        }

        const journeys = orderBy(get(data, "vehicleJourneys", []), ({departureTime}) =>
          timeToSeconds(departureTime)
        );

        return children({journeys, loading});
      }}
    </Query>
  );
});

export default VehicleJourneysQuery;
