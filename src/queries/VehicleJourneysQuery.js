import React from "react";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import gql from "graphql-tag";
import {observer} from "mobx-react-lite";
import {Query} from "react-apollo";
import {timeToSeconds} from "../helpers/time";
import {AlertFieldsFragment} from "./AlertFieldsFragment";
import {useRefetch} from "../hooks/useRefetch";

export const vehicleJourneysQuery = gql`
  query vehicleJourneysQuery($date: Date!, $uniqueVehicleId: VehicleId!) {
    vehicleJourneys(date: $date, uniqueVehicleId: $uniqueVehicleId) {
      id
      journeyType
      routeId
      direction
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

  const queryProps = {
    date,
    uniqueVehicleId,
  };

  const activateRefetch = useRefetch(updateListenerName, {...queryProps, skip});

  return (
    <Query query={vehicleJourneysQuery} variables={queryProps}>
      {({data, loading, refetch, error}) => {
        if (!loading && !error) {
          activateRefetch(refetch);
        }

        const journeys = orderBy(get(data, "vehicleJourneys", []), ({departureTime}) =>
          timeToSeconds(departureTime)
        );

        return children({journeys, loading, error});
      }}
    </Query>
  );
});

export default VehicleJourneysQuery;
