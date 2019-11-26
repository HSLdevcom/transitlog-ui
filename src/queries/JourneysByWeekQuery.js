import React, {useCallback, useEffect, useRef} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {observer} from "mobx-react-lite";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {AlertFieldsFragment} from "./AlertFieldsFragment";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";

export const routeJourneysByWeekQuery = gql`
  query journeysByWeekQuery(
    $routeId: String!
    $direction: Direction!
    $date: Date!
    $stopId: String!
    $lastStopArrival: Boolean
  ) {
    weeklyDepartures(
      routeId: $routeId
      direction: $direction
      date: $date
      stopId: $stopId
      lastStopArrival: $lastStopArrival
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
      mode
      isCancelled
      cancellations {
        ...CancellationFieldsFragment
      }
      alerts {
        ...AlertFieldsFragment
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
      }
      plannedDepartureTime {
        id
        departureDate
        departureDateTime
        departureTime
        isNextDay
      }
      plannedArrivalTime {
        id
        arrivalDate
        arrivalDateTime
        arrivalTime
        isNextDay
      }
      observedDepartureTime {
        id
        departureDate
        departureDateTime
        departureTime
        departureTimeDifference
      }
      observedArrivalTime {
        id
        arrivalDate
        arrivalDateTime
        arrivalTime
        arrivalTimeDifference
      }
      originDepartureTime {
        id
        departureDate
        departureDateTime
        departureTime
        isNextDay
      }
    }
  }
  ${AlertFieldsFragment}
  ${CancellationFieldsFragment}
`;

const updateListenerName = "journey week query";

const JourneysByWeekQuery = observer(
  ({children, route, date, lastStopArrival = false, skip}) => {
    const prevResults = useRef([]);

    const createRefetcher = useCallback(
      (refetch) => () => {
        const {routeId, direction, originStopId, destinationStopId} = route;

        if (refetch && route && route.routeId && !skip) {
          refetch({
            routeId,
            direction: parseInt(direction, 10),
            stopId: lastStopArrival ? destinationStopId : originStopId,
            lastStopArrival,
            date,
          });
        }
      },
      [route, date]
    );

    useEffect(() => () => removeUpdateListener(updateListenerName), []);

    const {routeId, direction, originStopId, destinationStopId} = route;

    const shouldSkip =
      skip || !routeId || !originStopId || (lastStopArrival && !destinationStopId);

    return (
      <Query
        skip={shouldSkip}
        query={routeJourneysByWeekQuery}
        variables={{
          lastStopArrival,
          routeId: routeId,
          direction: parseInt(direction, 10),
          stopId: lastStopArrival ? destinationStopId : originStopId,
          date,
        }}>
        {({data, error, loading, refetch}) => {
          if (!data || loading) {
            return children({departures: prevResults.current, loading, error});
          }

          const departures = get(data, "weeklyDepartures", []);

          setUpdateListener(updateListenerName, createRefetcher(refetch), false);

          prevResults.current = departures;
          return children({departures, loading, error});
        }}
      </Query>
    );
  }
);

export default JourneysByWeekQuery;
