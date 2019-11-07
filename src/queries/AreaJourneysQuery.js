import React from "react";
import {Query} from "react-apollo";
import get from "lodash/get";
import gql from "graphql-tag";
import {observer} from "mobx-react-lite";

const areaJourneysQuery = gql`
  query areaJourneysQuery(
    $minTime: DateTime!
    $maxTime: DateTime!
    $bbox: PreciseBBox!
    $date: Date!
  ) {
    journeysByBbox(minTime: $minTime, maxTime: $maxTime, bbox: $bbox, date: $date) {
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
      vehiclePositions {
        id
        recordedAt
        recordedAtUnix
        recordedTime
        stop
        lat
        lng
        doorStatus
        velocity
        delay
        heading
      }
    }
  }
`;

const AreaJourneysQuery = observer((props) => {
  const {minTime, maxTime, bbox, date, skip, children} = props;

  const queryParamsValid = minTime && maxTime && bbox && date;
  const shouldSkip = skip || !queryParamsValid;

  return (
    <Query
      skip={shouldSkip}
      variables={{
        minTime,
        maxTime,
        bbox,
        date,
      }}
      query={areaJourneysQuery}>
      {({loading, data, error}) => {
        if (!data || loading) {
          return children({journeys: [], loading, error});
        }

        const journeys = get(data, "journeysByBbox", []);
        return children({journeys, loading, error});
      }}
    </Query>
  );
});

export default AreaJourneysQuery;
