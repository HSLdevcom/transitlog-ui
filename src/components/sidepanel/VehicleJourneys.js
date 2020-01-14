import React, {useEffect, useState, useRef, useCallback} from "react";
import {observer} from "mobx-react-lite";
import SidepanelList from "./SidepanelList";
import styled from "styled-components";
import get from "lodash/get";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import getJourneyId from "../../helpers/getJourneyId";
import {transportColor} from "../transportModes";
import {
  ColoredSlot,
  TagButton,
  PlainSlot,
  ColoredBackgroundSlot,
  PlainSlotSmall,
} from "../TagButton";
import getDelayType from "../../helpers/getDelayType";
import doubleDigit from "../../helpers/doubleDigit";
import PlusMinusInput from "../PlusMinusInput";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import {secondsToTimeObject, timeToSeconds} from "../../helpers/time";
import {parseLineNumber} from "../../helpers/parseLineNumber";
import EmptyView from "../EmptyView";
import gql from "graphql-tag";
import {useQueryData} from "../../hooks/useQueryData";
import orderBy from "lodash/orderBy";

const JourneyListRow = styled.div`
  position: relative;
  padding: 0.25rem 0.4rem 0.25rem 0.4rem;
  margin: 0;
  background: ${({selected = false}) => (selected ? "var(--blue)" : "transparent")};

  &:first-child {
    margin-top: 0.25rem;
  }
`;

const HeaderRowLeft = styled.span`
  margin-right: 1rem;
  display: block;
  width: 100%;
`;

const HeadsignSlot = styled(ColoredSlot)`
  min-width: 4.75rem;
`;

const TimeSlot = styled(PlainSlot)`
  min-width: 4.5rem;
  font-weight: normal;
  text-align: center;
`;

const NextPrevLabel = styled.div`
  padding: 0 0.7rem;
  border-radius: 0.25rem;
  border: 1px solid var(--blue);
  height: calc(2rem + 2px);
  background: var(--lightest-grey);
  flex: 1 0 75%;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const vehicleJourneysQuery = gql`
  query vehicleJourneys($date: Date!, $uniqueVehicleId: VehicleId!) {
    vehicleJourneys(date: $date, uniqueVehicleId: $uniqueVehicleId) {
      id
      journeyType
      routeId
      direction
      departureDate
      departureTime
      uniqueVehicleId
      operatorId
      vehicleId
      headsign
      mode
      recordedAt
      recordedAtUnix
      recordedTime
      timeDifference
    }
  }
`;

const driverEventsQuery = gql`
  query driverEvents($date: Date!, $uniqueVehicleId: VehicleId!) {
    driverEvents(date: $date, uniqueVehicleId: $uniqueVehicleId) {
      id
      journeyType
      eventType
      uniqueVehicleId
      operatorId
      vehicleId
      mode
      recordedAt
      recordedAtUnix
      recordedTime
      lat
      lng
      mode
      receivedAt
    }
  }
`;

const decorate = flow(
  observer,
  inject("Journey", "Time")
);

const VehicleJourneys = decorate((props) => {
  const {Time, Journey, state} = props;
  const {selectedJourney, date, vehicle, user} = state;

  let [operatorId, vehicleNumber] = (vehicle || "").split("/");

  operatorId = parseInt(operatorId, 10);
  vehicleNumber = parseInt(vehicleNumber, 10);

  const uniqueVehicleId = `${operatorId}/${vehicleNumber}`;

  // Vehicle journeys
  const selectedJourneyIndex = useRef(0);
  const [nextJourneyIndex, setNextJourneyIndex] = useState(0);

  const queryProps = {
    date,
    uniqueVehicleId,
  };

  const {data: journeyData = [], loading, error} = useQueryData(
    vehicleJourneysQuery,
    {
      variables: queryProps,
    },
    "vehicle journeys"
  );

  // Driver events

  const {data: driverData = [], loading: driverLoading} = useQueryData(
    driverEventsQuery,
    {
      variables: queryProps,
    },
    "driver events"
  );

  const journeysAndDriverEvents = orderBy(
    [...(driverData || []), ...(journeyData || [])],
    (event) => {
      const time = get(event, "departureTime", get(event, "recordedTime"), "");

      if (!time) {
        return 0;
      }

      return timeToSeconds(time);
    }
  );

  const selectJourney = useCallback(
    (journey) => {
      let journeyToSelect = null;

      if (journey) {
        const journeyId = getJourneyId(journey);

        // Only set these if the journey is truthy and was not already selected
        if (journeyId && getJourneyId(state.selectedJourney) !== journeyId) {
          Time.setTime(journey.departureTime);
          journeyToSelect = journey;
        }
      }

      Journey.setSelectedJourney(journeyToSelect);
    },
    [state, Time, Journey]
  );

  const onSelectJourney = useCallback(
    (journey) => (e) => {
      e.preventDefault();
      selectJourney(journey);
    },
    [selectJourney]
  );

  const selectPreviousVehicleJourney = useCallback(() => {
    let nextIndex = selectedJourneyIndex.current - 1;

    // Clamp to 0
    if (nextIndex < 0) {
      nextIndex = 0;
    }

    setNextJourneyIndex(nextIndex);
  }, [selectedJourneyIndex.current]);

  const selectNextVehicleJourney = useCallback(() => {
    setNextJourneyIndex(selectedJourneyIndex.current + 1);
  }, [selectedJourneyIndex.current]);

  useEffect(() => {
    const journeys = journeysAndDriverEvents.filter(
      (evt) => !evt.id.startsWith("driver_event")
    );

    let useIndex = nextJourneyIndex;

    if (!journeys || journeys.length === 0) {
      return;
    }

    // Select the last journey if we're out of bounds
    if (useIndex > journeys.length - 1) {
      useIndex = journeys.length - 1;
    }

    const nextSelectedJourney = journeys[useIndex];

    // If the index corresponds to a journey, and it isn't already selected,
    // select it as the selected journey.
    if (
      nextSelectedJourney &&
      (!selectedJourney ||
        getJourneyId(nextSelectedJourney) !== getJourneyId(selectedJourney))
    ) {
      selectJourney(nextSelectedJourney);
    }
  }, [journeysAndDriverEvents, nextJourneyIndex, selectedJourney, selectJourney]);

  const selectedJourneyId = getJourneyId(selectedJourney, false);

  let journeyIndex = 0;

  return (
    <SidepanelList
      testIdPrefix="vehicle-block"
      focusKey={selectedJourneyId}
      loading={loading}
      header={
        <>
          <HeaderRowLeft>
            <PlusMinusInput
              plusLabel={<>&raquo;</>}
              minusLabel={<>&laquo;</>}
              onDecrease={selectPreviousVehicleJourney}
              onIncrease={selectNextVehicleJourney}>
              <NextPrevLabel>
                {selectedJourney ? (
                  <>
                    {vehicle}, {selectedJourney.departureTime.slice(0, -3)}
                  </>
                ) : (
                  vehicle
                )}
              </NextPrevLabel>
            </PlusMinusInput>
          </HeaderRowLeft>
        </>
      }>
      {(scrollRef) =>
        journeysAndDriverEvents.length === 0 && !loading && !driverLoading ? (
          <EmptyView
            error={error}
            text={
              user ? "message.emptyview.novehicleevents" : "message.emptyview.vehicleauth"
            }
          />
        ) : (
          journeysAndDriverEvents.map((journey) => {
            if (journey.id.startsWith("driver_event")) {
              return (
                <JourneyListRow key={journey.id}>
                  <TagButton data-testid="driver-event-row">
                    <PlainSlot>
                      {journey.eventType === "DA"
                        ? "Driver signed in"
                        : "Driver signed out"}
                    </PlainSlot>
                    <PlainSlotSmall>{journey.recordedTime}</PlainSlotSmall>
                  </TagButton>
                </JourneyListRow>
              );
            }

            const journeyId = getJourneyId(journey, false);

            const mode = get(journey, "mode", "").toUpperCase();
            const journeyTime = get(journey, "departureTime", "");
            const lineNumber = parseLineNumber(get(journey, "routeId", ""));

            const plannedObservedDiff = journey.timeDifference;
            const observedTimeString = journey.recordedTime;
            const diffTime = secondsToTimeObject(plannedObservedDiff);
            const delayType = getDelayType(plannedObservedDiff);

            const journeyIsSelected = selectedJourney && selectedJourneyId === journeyId;

            if (journeyIsSelected) {
              selectedJourneyIndex.current = journeyIndex;
            }

            journeyIndex++;

            return (
              <JourneyListRow
                selected={journeyIsSelected}
                key={`vehicle_journey_row_${journeyId}`}
                ref={journeyIsSelected ? scrollRef : null}>
                <TagButton
                  data-testid="vehicle-departure-option"
                  selected={journeyIsSelected}
                  onClick={onSelectJourney(journey)}>
                  <HeadsignSlot color={get(transportColor, mode, "var(--light-grey)")}>
                    {lineNumber}/{journey.direction}
                  </HeadsignSlot>
                  <TimeSlot>{journeyTime.slice(0, -3)}</TimeSlot>
                  <ColoredBackgroundSlot
                    color={delayType === "late" ? "var(--dark-grey)" : "white"}
                    backgroundColor={getTimelinessColor(delayType, "var(--light-green)")}>
                    {plannedObservedDiff < 0 ? "-" : ""}
                    {diffTime.hours ? doubleDigit(diffTime.hours) + ":" : ""}
                    {doubleDigit(diffTime.minutes)}:{doubleDigit(diffTime.seconds)}
                  </ColoredBackgroundSlot>
                  <PlainSlotSmall>{observedTimeString}</PlainSlotSmall>
                </TagButton>
              </JourneyListRow>
            );
          })
        )
      }
    </SidepanelList>
  );
});

export default VehicleJourneys;
