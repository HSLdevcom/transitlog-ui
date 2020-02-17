import React, {useMemo, useRef, useEffect} from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import HfpMarkerLayer from "./HfpMarkerLayer";
import JourneyLayer from "./JourneyLayer";
import {useCurrentEvent} from "../../hooks/useCurrentEvent";
import {useQueryData} from "../../hooks/useQueryData";
import gql from "graphql-tag";

export const unsignedEventsQuery = gql`
  query unsignedEventsQuery($date: Date!, $vehicleId: VehicleId!) {
    unsignedVehicleEvents(date: $date, uniqueVehicleId: $vehicleId) {
      id
      journeyType
      doorStatus
      heading
      lat
      lng
      loc
      operatorId
      recordedAt
      recordedAtUnix
      recordedTime
      uniqueVehicleId
      vehicleId
      velocity
      mode
    }
  }
`;

const decorate = flow(observer, inject("UI"));

const UnsignedEventsLayer = decorate(({state, UI}) => {
  const prevEvent = useRef(null);

  const {unixTime, vehicle, date, user, selectedJourney} = state;
  const shouldSkip = !!selectedJourney || !user || !vehicle;

  const {data: unsignedEventsData = [], loading} = useQueryData(
    unsignedEventsQuery,
    {
      skip: shouldSkip,
      variables: {
        vehicleId: vehicle,
        date: date,
      },
    },
    "unsigned events"
  );

  useEffect(() => {
    UI.toggleUnsignedEventsLoading(loading);
  }, [loading]);

  const unsignedEvents = unsignedEventsData || [];

  const currentEvent = useCurrentEvent(unsignedEvents, unixTime);

  if (currentEvent) {
    prevEvent.current = currentEvent;
  }

  const useEvent = currentEvent || prevEvent.current;

  const journey = useMemo(() => {
    const journeyEvent = unsignedEvents[0];
    return journeyEvent
      ? {
          journeyType: journeyEvent.journeyType,
          mode: journeyEvent.mode,
          uniqueVehicleId: journeyEvent.uniqueVehicleId,
        }
      : null;
  }, [unsignedEvents[0]]);

  if (shouldSkip || !unsignedEventsData || unsignedEvents.length === 0) {
    return null;
  }

  return (
    <>
      <JourneyLayer
        key={`unsigned_line_${journey.uniqueVehicleId}`}
        journey={journey}
        vehiclePositions={unsignedEvents}
        name={`unsigned/${journey.uniqueVehicleId}`}
      />
      {currentEvent && (
        <HfpMarkerLayer
          currentEvent={useEvent}
          isSelectedJourney={false}
          journey={journey}
        />
      )}
    </>
  );
});

export default UnsignedEventsLayer;
