import React, {useEffect, useState, useCallback, useMemo} from "react";
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
import {text} from "../../helpers/text";
import Tooltip from "../Tooltip";
import {LocBadge} from "../commonComponents";

const JourneyListRow = styled.div`
  position: relative;
  padding: 0.25rem 0.4rem 0.25rem 0.4rem;
  margin: 0;
  background: ${({selected = false}) => (selected ? "var(--blue)" : "transparent")};

  &:first-child {
    margin-top: 0.25rem;
  }
`;

const DriverEventRow = styled(JourneyListRow)`
  background: ${({selected = false}) => (selected ? "var(--light-blue)" : "transparent")};
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
      loc
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
      loc
      mode
      receivedAt
    }
  }
`;

const decorate = flow(
  observer,
  inject("Journey", "Time", "UI")
);

const VehicleJourneys = decorate((props) => {
  const {Time, Journey, UI, state} = props;
  const {selectedJourney, date, vehicle, user, mapDriverEvent} = state;

  const [selectedJourneyIndex, setSelectedJourneyIndex] = useState(0);

  // Get a correct unique vehicle ID for the request (without leading zeroes)
  let [operatorId, vehicleNumber] = (vehicle || "").split("/");
  operatorId = parseInt(operatorId, 10);
  vehicleNumber = parseInt(vehicleNumber, 10);
  const uniqueVehicleId = `${operatorId}/${vehicleNumber}`;

  const queryProps = {
    date,
    uniqueVehicleId,
  };

  // Vehicle journeys

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

  // Combine vehicle journeys and driver events, and sort by time.
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

  const selectedJourneyId = getJourneyId(selectedJourney, false);

  const selectJourney = useCallback(
    (journey) => {
      let journeyToSelect = null;

      if (journey) {
        const journeyId = getJourneyId(journey, false);

        // Only set these if the journey is truthy and was not already selected
        if (journeyId && selectedJourneyId !== journeyId) {
          Time.setTime(journey.departureTime);
          journeyToSelect = journey;
        }
      }

      Journey.setSelectedJourney(journeyToSelect);
    },
    [selectedJourneyId, Time, Journey]
  );

  const onSelectJourney = useCallback(
    (journey) => (e) => {
      e.preventDefault();
      selectJourney(journey);
    },
    [selectJourney]
  );

  const onSelectEvent = useCallback(
    (driverEvent) => (e) => {
      e.preventDefault();

      if (mapDriverEvent && mapDriverEvent.id === driverEvent.id) {
        UI.setMapDriverEvent(null);
      } else {
        const {id, eventType, lat, lng} = driverEvent;

        const mapEvent = {
          id,
          eventType,
          lat,
          lng,
        };

        UI.setMapDriverEvent(mapEvent);
      }
    },
    [UI, mapDriverEvent]
  );

  const journeysOnly = useMemo(
    () => journeysAndDriverEvents.filter((evt) => !evt.id.startsWith("driver_event")),
    [journeysAndDriverEvents]
  );

  // Mark next journey (as set by the prev/next functions above) as selected.
  const selectJourneyAtIndex = useCallback(
    (index) => {
      if (!journeysOnly || journeysOnly.length === 0) {
        return;
      }

      let useIndex = index;

      if (useIndex > journeysOnly.length - 1) {
        useIndex = journeysOnly.length - 1;
      } else if (useIndex <= 0) {
        useIndex = 0;
      }

      if (useIndex === selectedJourneyIndex) {
        return;
      }

      const nextJourney = journeysOnly[useIndex];

      // If the index corresponds to a journey, and it isn't already selected,
      // select it as the selected journey.
      if (
        nextJourney &&
        (!selectedJourney || selectedJourneyId !== getJourneyId(nextJourney, false))
      ) {
        selectJourney(nextJourney);
      }
    },
    [journeysOnly, selectedJourney, selectJourney]
  );

  const selectPreviousVehicleJourney = useCallback(() => {
    let nextIndex = selectedJourneyIndex - 1;

    // Clamp to 0
    if (nextIndex < 0) {
      nextIndex = 0;
    }

    selectJourneyAtIndex(nextIndex);
  }, [selectedJourneyIndex]);

  const selectNextVehicleJourney = useCallback(() => {
    const nextIndex = selectedJourneyIndex + 1;
    selectJourneyAtIndex(nextIndex);
  }, [selectedJourneyIndex]);

  // Sync local selectedJourneyIndex state with actual selected journey state.
  useEffect(() => {
    let idx = 0;

    if (!selectedJourney) {
      return;
    }

    for (const journey of journeysOnly) {
      if (selectedJourneyId === getJourneyId(journey, false)) {
        // Save the index of the selected journey in local state.
        setSelectedJourneyIndex(idx);
        break;
      }

      idx++;
    }
  }, [journeysOnly, selectedJourney]);

  // Remove the driver event marker when the vehicle changes or this component unmounts.
  useEffect(() => () => UI.setMapDriverEvent(null), [vehicle]);

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
            // Render driver event
            if (journey.id.startsWith("driver_event")) {
              const isSelected = mapDriverEvent && mapDriverEvent.id === journey.id;

              return (
                <DriverEventRow selected={isSelected} key={journey.id}>
                  <TagButton
                    selected={isSelected}
                    onClick={onSelectEvent(journey)}
                    data-testid="driver-event-row">
                    <PlainSlot>
                      {journey.eventType === "DA"
                        ? text("journey.event.DA")
                        : text("journey.event.DOUT")}
                    </PlainSlot>
                    <LocBadge red={journey.loc !== "GPS"}>{journey.loc}</LocBadge>
                    <PlainSlotSmall>{journey.recordedTime}</PlainSlotSmall>
                  </TagButton>
                </DriverEventRow>
              );
            }

            // The rest of the function is about rendering vehicle journeys.

            const journeyId = getJourneyId(journey, false);

            const mode = get(journey, "mode", "").toUpperCase();
            const journeyTime = get(journey, "departureTime", "");
            const lineNumber = parseLineNumber(get(journey, "routeId", ""));

            const plannedObservedDiff = journey.timeDifference || 0;
            const observedTimeString = journey.recordedTime;
            const diffTime = secondsToTimeObject(plannedObservedDiff);
            const delayType = getDelayType(plannedObservedDiff);

            const journeyIsSelected = selectedJourney && selectedJourneyId === journeyId;

            return (
              <JourneyListRow
                title={journey.loc}
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
