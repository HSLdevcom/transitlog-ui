import React, {useEffect, useCallback} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {useRefetch} from "../hooks/useRefetch";
import {observer} from "mobx-react-lite";

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
        stop
        recordedAt
        recordedAtUnix
        recordedTime
        velocity
      }
    }
  }
`;

const updateListenerName = "route journeys";

const RouteJourneysQuery = observer((props) => {
  const {routeId, direction, date, skip, children} = props;

  const shouldSkip = skip || !routeId || !direction || !date;

  const queryProps = {
    routeId,
    direction,
    departureDate: date,
  };

  const activateRefetch = useRefetch(updateListenerName, {
    ...queryProps,
    skip: shouldSkip,
  });

  return (
    <Query
      partialRefetch={true}
      skip={shouldSkip}
      query={routeJourneysQuery}
      variables={queryProps}>
      {({data, loading, error, refetch}) => {
        if (!data || loading) {
          return children({routeJourneys: [], loading, error});
        }

        activateRefetch(refetch);
        const routeJourneys = get(data, "journeys", []);

        return children({routeJourneys, loading, error});
      }}
    </Query>
  );
});

export default RouteJourneysQuery;
