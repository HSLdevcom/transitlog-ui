import React, {useMemo} from "react";
import {observer} from "mobx-react-lite";
import {Query} from "@apollo/react-components";
import gql from "graphql-tag";
import get from "lodash/get";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";
import {useRefetch} from "../hooks/useRefetch";

export const departuresQuery = gql`
  query departures(
    $stopId: String!
    $date: Date!
    $routeId: String
    $minHour: Int
    $maxHour: Int
  ) {
    departures(
      stopId: $stopId
      date: $date
      filter: {routeId: $routeId, maxHour: $maxHour, minHour: $minHour}
    ) {
      id
      stopId
      routeId
      direction
      dayType
      departureId
      departureDate
      departureTime
      equipmentColor
      equipmentType
      extraDeparture
      index
      isNextDay
      isTimingStop
      operatorId
      terminalTime
      recoveryTime
      isCancelled
      cancellations {
        ...CancellationFieldsFragment
      }
      journey {
        id
        journeyType
        type
        routeId
        direction
        originStopId
        departureDate
        departureTime
        uniqueVehicleId
        _numInstance
      }
      originDepartureTime {
        departureDate
        departureDateTime
        departureTime
        id
        isNextDay
      }
      observedDepartureTime {
        id
        departureDate
        departureTime
        departureDateTime
        departureTimeDifference
      }
      plannedDepartureTime {
        id
        departureDate
        departureTime
        departureDateTime
      }
    }
  }
  ${CancellationFieldsFragment}
`;

const updateListenerName = "departures query";

const DeparturesQuery = observer(
  ({stopId, date, routeId, minHour, maxHour, skip = false, children}) => {
    const shouldSkip = skip || !stopId || !date;

    const queryProps = useMemo(
      () => ({
        stopId,
        date,
        routeId,
        minHour,
        maxHour,
      }),
      [date, stopId, routeId, maxHour, minHour]
    );

    const activateRefetch = useRefetch(updateListenerName, {
      ...queryProps,
      skip: shouldSkip,
    });

    return (
      <Query query={departuresQuery} variables={queryProps} skip={shouldSkip}>
        {({loading, error, data, refetch}) => {
          if (loading || error) {
            return children({departures: [], loading, error});
          }

          activateRefetch(refetch);

          const departures = get(data, "departures", []);
          return children({departures, loading: false, error});
        }}
      </Query>
    );
  }
);

export default DeparturesQuery;
