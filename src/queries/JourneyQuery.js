import React, {useMemo} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {AlertFieldsFragment} from "./AlertFieldsFragment";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";
import {useRefetch} from "../hooks/useRefetch";

export const journeyQuery = gql`
  query journeyQuery(
    $departureDate: Date!
    $routeId: String!
    $departureTime: Time!
    $direction: Direction!
    $uniqueVehicleId: VehicleId!
    $unsignedEvents: Boolean
  ) {
    journey(
      routeId: $routeId
      direction: $direction
      departureTime: $departureTime
      departureDate: $departureDate
      uniqueVehicleId: $uniqueVehicleId
      unsignedEvents: $unsignedEvents
    ) {
      id
      journeyType
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
      journeyDurationMinutes
      journeyLength
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
        journeyType
        delay
        doorStatus
        heading
        lat
        lng
        stop
        nextStopId
        recordedAt
        recordedAtUnix
        recordedTime
        velocity
      }
      events {
        __typename
        ... on JourneyCancellationEvent {
          id
          type
          cancellationEffect
          cancellationType
          category
          description
          isCancelled
          plannedDate
          plannedTime
          recordedAt
          recordedAtUnix
          recordedTime
          subCategory
          title
        }
        ... on JourneyStopEvent {
          id
          departureId
          doorsOpened
          index
          isNextDay
          isTimingStop
          plannedDate
          plannedDateTime
          plannedTime
          plannedTimeDifference
          recordedAt
          recordedAtUnix
          recordedTime
          stopId
          stopped
          unplannedStop
          type
          isOrigin
          isTimingStop
          lat
          lng
          _isVirtual
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
          isOrigin
          isTimingStop
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
          stopId
          lat
          lng
          _isVirtual
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
      routeDepartures {
        id
        stopId
        isTimingStop
        index
        plannedDepartureTime {
          id
          departureDateTime
        }
        plannedArrivalTime {
          id
          arrivalDateTime
        }
      }
    }
  }
  ${AlertFieldsFragment}
  ${CancellationFieldsFragment}
`;

const updateListenerName = "selected journey";

const JourneyQuery = ({
  children,
  skip = false,
  journey = null,
  includeUnsigned = false,
}) => {
  const queryVars = useMemo(() => {
    const {routeId, direction, departureDate, departureTime, uniqueVehicleId} =
      journey || {};

    return {
      routeId,
      direction,
      departureDate,
      departureTime,
      uniqueVehicleId,
      unsignedEvents: includeUnsigned,
    };
  }, [journey, includeUnsigned]);

  const shouldSkip = skip || !journey;
  const activateRefetch = useRefetch(
    updateListenerName,
    {...queryVars, skip: shouldSkip},
    true
  );

  return (
    <Query
      skip={shouldSkip}
      query={journeyQuery}
      variables={queryVars}
      partialRefetch={true}>
      {({data, loading, error, refetch}) => {
        if (!data || loading) {
          return children({
            journey: null,
            loading,
            error,
          });
        }

        activateRefetch(refetch);
        const journey = get(data, "journey", null);
        return children({journey, loading, error});
      }}
    </Query>
  );
};

export default JourneyQuery;
