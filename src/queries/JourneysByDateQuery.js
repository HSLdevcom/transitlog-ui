import React, {useCallback, useEffect} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {observer} from "mobx-react-lite";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {AlertFieldsFragment} from "./AlertFieldsFragment";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";

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

const updateListenerName = "journey list query";

const JourneysByDateQuery = observer(({children, route, date, skip}) => {
  const createRefetcher = useCallback(
    (refetch) => () => {
      const {routeId, direction, originStopId} = route;

      if (refetch && route && route.routeId && !skip) {
        refetch({
          routeId,
          direction: parseInt(direction, 10),
          stopId: originStopId,
          date,
        });
      }
    },
    [route, date]
  );

  useEffect(() => () => removeUpdateListener(updateListenerName), []);

  const {routeId, direction, originStopId} = route;
  const shouldSkip = skip || !route || !routeId || !direction || !originStopId;
  const queryVars = {
    routeId: routeId,
    direction: parseInt(direction, 10),
    stopId: originStopId || "",
    date,
  };

  return (
    <Query skip={shouldSkip} query={routeJourneysQuery} variables={queryVars}>
      {({data, error, loading, refetch}) => {
        if (!data || loading) {
          return children({departures: [], loading, error, skipped: shouldSkip});
        }

        const departures = get(data, "routeDepartures", []);

        setUpdateListener(updateListenerName, createRefetcher(refetch), false);
        return children({departures, loading, error, skipped: shouldSkip});
      }}
    </Query>
  );
});

export default JourneysByDateQuery;
