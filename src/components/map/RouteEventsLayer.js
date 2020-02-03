import React, {useMemo, useRef} from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import HfpMarkerLayer from "./HfpMarkerLayer";
import JourneyLayer from "./JourneyLayer";
import gql from "graphql-tag";
import {useQueryData} from "../../hooks/useQueryData";
import {useCurrentEvent} from "../../hooks/useCurrentEvent";

const routeJourneysQuery = gql`
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
        loc
        stop
        recordedAt
        recordedAtUnix
        recordedTime
        velocity
      }
    }
  }
`;

const decorate = flow(observer, inject("state"));

const RouteEventsLayer = decorate(({state}) => {
  const {unixTime, route, selectedJourney, date} = state;
  const {routeId = null, direction = null} = route;

  const prevEvent = useRef(null);

  const shouldSkip = !!selectedJourney || !routeId || !direction;

  const {data: routeEventsData = [], loading} = useQueryData(routeJourneysQuery, {
    skip: shouldSkip,
    variables: {
      routeId,
      direction,
      departureDate: date,
    },
  });

  const routeEvents = routeEventsData || [];
  const currentEvent = useCurrentEvent(routeEvents, unixTime);

  if (currentEvent) {
    prevEvent.current = currentEvent;
  }

  const useEvent = currentEvent || prevEvent.current;
  const journeyEvent = routeEvents[0];

  const journey = useMemo(() => {
    return journeyEvent
      ? {
          journeyType: journeyEvent.journeyType,
          mode: journeyEvent.mode,
          uniqueVehicleId: journeyEvent.uniqueVehicleId,
        }
      : null;
  }, [journeyEvent]);

  if (!!selectedJourney || !useEvent || !journey) {
    return null;
  }

  return (
    <HfpMarkerLayer currentEvent={useEvent} isSelectedJourney={false} journey={journey} />
  );
});

export default RouteEventsLayer;
