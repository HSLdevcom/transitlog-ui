import React, {useEffect, useCallback} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";

export const routeJourneysQuery = gql`
  query routeJourneyQuery(
    $departureDate: Date!
    $routeId: String!
    $direction: Direction!
  ) {
    journeys(routeId: $routeId, direction: $direction, departureDate: $departureDate) {
      id
      journeyType
      routeId
      direction
      departureDate
      departureTime
      uniqueVehicleId
      mode
      vehiclePositions {
        id
        delay
        doorStatus
        heading
        lat
        lng
        nextStopId
        recordedAt
        recordedAtUnix
        recordedTime
        velocity
      }
    }
  }
`;

const updateListenerName = "route journeys";

const RouteJourneysQuery = (props) => {
  const {routeId, direction, date, skip, children} = props;

  const createRefetcher = useCallback(
    (refetch) => () => {
      if (!skip && routeId && direction && date) {
        refetch({
          routeId,
          direction,
          departureDate: date,
        });
      }
    },
    [routeId, direction, date, skip]
  );

  useEffect(() => () => removeUpdateListener(updateListenerName), []);

  return (
    <Query
      partialRefetch={true}
      skip={skip || !routeId || !direction || !date}
      query={routeJourneysQuery}
      variables={{
        routeId,
        direction,
        departureDate: date,
      }}>
      {({data, loading, error, refetch}) => {
        if (!data || loading) {
          return children({routeJourneys: [], loading, error});
        }

        setUpdateListener(updateListenerName, createRefetcher(refetch), false);
        const routeJourneys = get(data, "journeys", []);

        return children({routeJourneys, loading, error});
      }}
    </Query>
  );
};

export default RouteJourneysQuery;
