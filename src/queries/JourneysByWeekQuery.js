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
  ) {
    weeklyDepartures(
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

const updateListenerName = "journey weel query";

const JourneysByWeekQuery = observer(({children, route, date, skip}) => {
  const prevResults = useRef([]);

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

  return (
    <Query
      fetchPolicy="cache-and-network"
      query={routeJourneysByWeekQuery}
      variables={{
        routeId: routeId,
        direction: parseInt(direction, 10),
        stopId: originStopId,
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
});

export default JourneysByWeekQuery;
