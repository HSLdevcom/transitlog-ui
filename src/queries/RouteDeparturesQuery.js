import React, {useMemo} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {observer} from "mobx-react-lite";
import {AlertFieldsFragment} from "./AlertFieldsFragment";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";
import {useRefetch} from "../hooks/useRefetch";

export const routeJourneysQuery = gql`
  query journeysByDateQuery(
    $routeId: String!
    $direction: Direction!
    $date: Date!
    $stopId: String!
  ) {
    routeDepartures(
      routeId: $routeId
      direction: $direction
      date: $date
      stopId: $stopId
    ) {
      id
      index
      isNextDay
      isTimingStop
      dayType
      departureId
      departureDate
      departureTime
      equipmentColor
      equipmentType
      extraDeparture
      operatorId
      terminalTime
      recoveryTime
      routeId
      direction
      stopId
      isCancelled
      alerts {
        ...AlertFieldsFragment
      }
      cancellations {
        ...CancellationFieldsFragment
      }
      journey {
        id
        journeyType
        departureDate
        departureTime
        direction
        routeId
        originStopId
        uniqueVehicleId
        mode
        _numInstance
        alerts {
          ...AlertFieldsFragment
        }
      }
      plannedArrivalTime {
        id
        arrivalDate
        arrivalDateTime
        arrivalTime
        isNextDay
      }
      observedArrivalTime {
        id
        arrivalDate
        arrivalDateTime
        arrivalTime
        arrivalTimeDifference
      }
      plannedDepartureTime {
        id
        departureDate
        departureDateTime
        departureTime
        isNextDay
      }
      observedDepartureTime {
        id
        departureDate
        departureDateTime
        departureTime
        departureTimeDifference
      }
    }
  }
  ${AlertFieldsFragment}
  ${CancellationFieldsFragment}
`;

const updateListenerName = "route departures query";

const RouteDeparturesQuery = observer(({children, route, date, skip}) => {
  const {routeId, direction, originStopId} = route;
  const shouldSkip = skip || !route || !routeId || !direction || !originStopId;

  const queryVars = useMemo(
    () => ({
      routeId: routeId,
      direction: parseInt(direction, 10),
      stopId: originStopId || "",
      date,
    }),
    [routeId, direction, originStopId, date]
  );

  const activateRefetch = useRefetch(
    updateListenerName,
    {
      ...queryVars,
      skip: shouldSkip,
    },
    true
  );

  return (
    <Query skip={shouldSkip} query={routeJourneysQuery} variables={queryVars}>
      {({data, error, loading, refetch}) => {
        if (!data || loading) {
          return children({departures: [], loading, error, skipped: shouldSkip});
        }

        activateRefetch(refetch);

        const departures = get(data, "routeDepartures", []);
        return children({departures, loading, error, skipped: shouldSkip});
      }}
    </Query>
  );
});

export default RouteDeparturesQuery;
