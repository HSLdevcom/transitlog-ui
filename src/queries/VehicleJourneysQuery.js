import React from "react";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import {observer} from "mobx-react-lite";
import {Query} from "@apollo/react-components";
import {timeToSeconds} from "../helpers/time";
import {useRefetch} from "../hooks/useRefetch";

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
