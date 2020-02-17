import React, {useRef, useMemo} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "@apollo/react-components";
import {observer} from "mobx-react-lite";
import {AlertFieldsFragment} from "./AlertFieldsFragment";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";
import {useRefetch} from "../hooks/useRefetch";

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
        loc
      }
      observedArrivalTime {
        id
        arrivalDate
        arrivalDateTime
        arrivalTime
        arrivalTimeDifference
        loc
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
    const {routeId, direction, originStopId, destinationStopId} = route;

    const shouldSkip =
      skip || !routeId || !originStopId || (lastStopArrival && !destinationStopId);

    const queryProps = useMemo(
      () => ({
        lastStopArrival,
        routeId: routeId,
        direction: parseInt(direction, 10),
        stopId: lastStopArrival ? destinationStopId : originStopId,
        date,
      }),
      [lastStopArrival, routeId, direction, destinationStopId, originStopId, date]
    );

    const prevResults = useRef([]);
    const activateRefetch = useRefetch(updateListenerName, {
      ...queryProps,
      skip: shouldSkip,
    });

    return (
      <Query skip={shouldSkip} query={routeJourneysByWeekQuery} variables={queryProps}>
        {({data, error, loading, refetch}) => {
          if (!data || loading) {
            return children({departures: prevResults.current, loading, error});
          }

          const departures = get(data, "weeklyDepartures", []);

          activateRefetch(refetch);

          prevResults.current = departures;
          return children({departures, loading, error});
        }}
      </Query>
    );
  }
);

export default JourneysByWeekQuery;
