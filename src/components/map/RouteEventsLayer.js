import React, {useMemo, useEffect} from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import HfpMarkerLayer from "./HfpMarkerLayer";
import gql from "graphql-tag";
import {useQueryData} from "../../hooks/useQueryData";
import {getCurrentEvent} from "../../hooks/useCurrentEvent";

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
        receivedAt
        recordedAt
        recordedAtUnix
        recordedTime
        velocity
      }
    }
  }
`;

const decorate = flow(observer, inject("UI"));

const RouteEventsLayer = decorate(({state, UI}) => {
  const {unixTime, route, selectedJourney, date} = state;
  const {routeId = null, direction = null} = route;

  const shouldSkip = !!selectedJourney || !routeId || !direction;

  const {data: routeJourneysData = [], loading} = useQueryData(
    routeJourneysQuery,
    {
      skip: shouldSkip,
      variables: {
        routeId,
        direction,
        departureDate: date,
      },
    },
    "route journeys"
  );

  useEffect(() => {
    UI.toggleRouteJourneysLoading(loading);
  }, [loading]);

  const routeJourneys = routeJourneysData || [];

  const currentEvents = useMemo(() => {
    const results = [];

    for (const journey of routeJourneys) {
      if (!journey || journey.vehiclePositions.length === 0) {
        continue;
      }

      const currentJourneyEvent = getCurrentEvent(journey.vehiclePositions, unixTime);
      results.push({journey, currentEvent: currentJourneyEvent});
    }

    return results;
  }, [unixTime, routeJourneys]);

  if (!!selectedJourney || currentEvents.length === 0) {
    return null;
  }

  return currentEvents.map(({journey, currentEvent}) => (
    <HfpMarkerLayer
      key={journey.id}
      currentEvent={currentEvent}
      isSelectedJourney={false}
      journey={journey}
    />
  ));
});

export default RouteEventsLayer;
