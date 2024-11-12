import React from "react";
import {Query} from "@apollo/react-components";
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
        loc
        doorStatus
        velocity
        delay
        heading
      }
    }
  }
`;

const areaSpeedsQuery = gql`
  query areaSpeedsQuery(
    $minTime: DateTime!
    $maxTime: DateTime!
    $bbox: PreciseBBox!
    $date: Date!
    $routeId: String!
    $speedFilter: String!
  ) {
    journeysByBboxAndRouteId(
      minTime: $minTime
      maxTime: $maxTime
      bbox: $bbox
      date: $date
      routeId: $routeId
      speedFilter: $speedFilter
    ) {
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
        loc
        doorStatus
        velocity
        delay
        heading
      }
    }
  }
`;

const AreaJourneysQuery = observer((props) => {
  const {
    minTime,
    maxTime,
    bbox,
    date,
    skip,
    children,
    speedSearch,
    routeId,
    speedFilter,
  } = props;

  const queryParamsValid = minTime && maxTime && bbox && date;
  const shouldSkip = skip || !queryParamsValid;
  const variables = {
    minTime,
    maxTime,
    bbox,
    date,
  };
  const areaQuery = speedSearch ? areaSpeedsQuery : areaJourneysQuery;
  const resultSelector = speedSearch ? "journeysByBboxAndRouteId" : "journeysByBbox";
  if (speedSearch) {
    variables.routeId = routeId;
    variables.speedFilter = speedFilter;
  }
  return (
    <Query
      skip={shouldSkip}
      returnPartialData={true}
      variables={variables}
      query={areaQuery}>
      {({loading, data, error}) => {
        if (!data || loading) {
          return children({journeys: [], loading, error});
        }

        const journeys = get(data, resultSelector, []);
        const areaSpeeds = get(data, resultSelector, []);
        return children({journeys, areaSpeeds, loading, error});
      }}
    </Query>
  );
});

export default AreaJourneysQuery;
