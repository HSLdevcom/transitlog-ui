import React, {useCallback, useMemo} from "react";
import {observer} from "mobx-react-lite";
import getJourneyId from "../../helpers/getJourneyId";
import styled from "styled-components";
import {Text} from "../../helpers/text";
import SidepanelList from "./SidepanelList";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import EmptyView from "../EmptyView";
import RouteDepartureItem from "./RouteDepartureItem";
import {useQueryData} from "../../hooks/useQueryData";
import gql from "graphql-tag";
import {CancellationFieldsFragment} from "../../queries/CancellationFieldsFragment";

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
      cancellations {
        ...CancellationFieldsFragment
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
        loc
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
        loc
      }
    }
  }
  ${CancellationFieldsFragment}
`;

const HeaderRowLeft = styled.span`
  display: block;
  font-weight: bold;
  min-width: 7.5rem;
  text-align: left;
  position: relative;
`;

const JourneyListHeader = styled.div`
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const decorate = flow(observer, inject("Journey", "Filters", "Time", "UI"));

const RouteDepartures = decorate(({state, Time, Journey, UI}) => {
  const {date, route, selectedJourney} = state;
  const selectedJourneyId = getJourneyId(selectedJourney);

  const selectJourney = useCallback((journey, matchVehicle = true) => {
    let journeyToSelect = null;

    if (journey) {
      const journeyId = getJourneyId(journey, matchVehicle);
      const selectedJourneyId = getJourneyId(state.selectedJourney, matchVehicle);

      UI.allowObjectCentering(true);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && selectedJourneyId !== journeyId) {
        Time.setTime(journey.departureTime);
        journeyToSelect = journey;
      }
    }

    Journey.setSelectedJourney(journeyToSelect);
  }, []);

  const {routeId, direction, originStopId} = route;
  const shouldSkip = !route || !routeId || !direction || !originStopId;

  const queryVars = useMemo(
    () => ({
      routeId: routeId,
      direction: parseInt(direction, 10),
      stopId: originStopId || "",
      date,
    }),
    [routeId, direction, originStopId, date]
  );

  const {data: departuresData = [], loading, error} = useQueryData(
    routeJourneysQuery,
    {
      skip: shouldSkip,
      variables: queryVars,
    },
    "route departures"
  );

  const departures = departuresData || [];

  return (
    <>
      {error || (!loading && !shouldSkip && departures.length === 0) ? (
        <EmptyView
          error={
            error ? error : {emptyDataError: {message: "No data returned from server."}}
          }
        />
      ) : (
        <SidepanelList
          testIdPrefix="journey"
          focusKey={selectedJourneyId}
          loading={loading}
          header={
            <JourneyListHeader data-testid="journey-list-header">
              <HeaderRowLeft>
                <Text>filterpanel.planned_start_time</Text>
              </HeaderRowLeft>
              <span>
                <Text>filterpanel.real_start_time</Text>
              </span>
            </JourneyListHeader>
          }>
          {(scrollRef) =>
            departures.map((departure) => (
              <RouteDepartureItem
                key={departure.id}
                departure={departure}
                scrollRef={scrollRef}
                selectJourney={selectJourney}
              />
            ))
          }
        </SidepanelList>
      )}
    </>
  );
});

export default RouteDepartures;
