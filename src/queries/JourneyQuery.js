import React, {useEffect, useCallback, useMemo} from "react";
import get from "lodash/get";
import pick from "lodash/pick";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {AlertFieldsFragment} from "./AlertFieldsFragment";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";

export const journeyQuery = gql`
  query journeyQuery(
    $departureDate: Date!
    $routeId: String!
    $departureTime: Time!
    $direction: Direction!
    $uniqueVehicleId: VehicleId!
  ) {
    journey(
      routeId: $routeId
      direction: $direction
      departureTime: $departureTime
      departureDate: $departureDate
      uniqueVehicleId: $uniqueVehicleId
    ) {
      id
      lineId
      routeId
      originStopId
      direction
      departureDate
      departureTime
      uniqueVehicleId
      operatorId
      vehicleId
      name
      mode
      headsign
      isCancelled
      cancellations {
        ...CancellationFieldsFragment
      }
      alerts {
        ...AlertFieldsFragment
      }
      equipment {
        age
        emissionClass
        emissionDesc
        exteriorColor
        id
        operatorId
        operatorName
        registryNr
        type
        vehicleId
      }
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
      events {
        __typename
        ... on JourneyStopEvent {
          id
          departureId
          doorsOpened
          index
          isNextDay
          isTimingStop
          nextStopId
          plannedDate
          plannedDateTime
          plannedTime
          plannedTimeDifference
          recordedAt
          recordedAtUnix
          recordedTime
          stopId
          stopped
          type
          stop {
            id
            isTimingStop
            lat
            lng
            modes
            name
            radius
            shortId
            stopId
            alerts {
              ...AlertFieldsFragment
            }
          }
        }
        ... on PlannedStopEvent {
          id
          departureId
          index
          isNextDay
          isTimingStop
          plannedDate
          plannedDateTime
          plannedTime
          stopId
          type
          stop {
            id
            isTimingStop
            lat
            lng
            modes
            name
            radius
            shortId
            stopId
            alerts {
              ...AlertFieldsFragment
            }
          }
        }
        ... on JourneyEvent {
          id
          recordedAt
          recordedAtUnix
          recordedTime
          type
        }
      }
      departure {
        id
        stopId
        dayType
        departureId
        departureDate
        departureTime
        equipmentColor
        equipmentIsRequired
        equipmentType
        extraDeparture
        index
        isNextDay
        isTimingStop
        operatorId
        terminalTime
        recoveryTime
        isCancelled
        alerts {
          ...AlertFieldsFragment
        }
        stop {
          id
          isTimingStop
          lat
          lng
          modes
          name
          radius
          shortId
          stopId
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
          isNextDay
        }
      }
    }
  }
  ${AlertFieldsFragment}
  ${CancellationFieldsFragment}
`;

const updateListenerName = "selected journey";

const JourneyQuery = (props) => {
  const queryVars = useMemo(
    () =>
      pick(
        get(props, "journey", {}),
        "routeId",
        "direction",
        "departureDate",
        "departureTime",
        "uniqueVehicleId"
      ),
    [props.journey]
  );

  const createRefetcher = useCallback(
    (refetch) => () => {
      const {skip, journey} = props;

      if (journey && !skip) {
        refetch(queryVars);
      }
    },
    [props.skip, queryVars]
  );

  useEffect(() => () => removeUpdateListener(updateListenerName), []);

  const {skip, journey, children} = props;

  return (
    <Query
      partialRefetch={true}
      skip={skip || !journey}
      query={journeyQuery}
      variables={queryVars}>
      {({data, loading, error, refetch}) => {
        if (!data || loading) {
          return children({journey: null, loading, error});
        }

        setUpdateListener(updateListenerName, createRefetcher(refetch));
        const journey = get(data, "journey", null);

        return children({journey, loading, error});
      }}
    </Query>
  );
};

export default JourneyQuery;
