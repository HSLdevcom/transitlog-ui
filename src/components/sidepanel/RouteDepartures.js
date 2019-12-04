import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import getJourneyId from "../../helpers/getJourneyId";
import styled from "styled-components";
import {Text} from "../../helpers/text";
import SidepanelList from "./SidepanelList";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import RouteDeparturesQuery from "../../queries/RouteDeparturesQuery";
import EmptyView from "../EmptyView";
import RouteDepartureItem from "./RouteDepartureItem";

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

const decorate = flow(
  observer,
  inject("Journey", "Filters", "Time")
);

const RouteDepartures = decorate(({state, Time, Journey}) => {
  const {date, route, selectedJourney} = state;
  const selectedJourneyId = getJourneyId(selectedJourney);

  const selectJourney = useCallback((journey, matchVehicle = true) => {
    let journeyToSelect = null;

    if (journey) {
      const journeyId = getJourneyId(journey, matchVehicle);
      const selectedJourneyId = getJourneyId(state.selectedJourney, matchVehicle);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && selectedJourneyId !== journeyId) {
        Time.setTime(journey.departureTime);
        journeyToSelect = journey;
      }
    }

    Journey.setSelectedJourney(journeyToSelect);
  }, []);

  return (
    <RouteDeparturesQuery route={route} date={date}>
      {({departures, loading, error, skipped}) => {
        return error || (!loading && !skipped && departures.length === 0) ? (
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
        );
      }}
    </RouteDeparturesQuery>
  );
});

export default RouteDepartures;
