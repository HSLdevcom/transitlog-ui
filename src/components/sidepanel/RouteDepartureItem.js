import React, {useMemo} from "react";
import {observer} from "mobx-react-lite";
import get from "lodash/get";
import doubleDigit from "../../helpers/doubleDigit";
import getDelayType from "../../helpers/getDelayType";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import getJourneyId from "../../helpers/getJourneyId";
import {
  secondsToTimeObject,
  getNormalTime,
  getMomentFromDateTime,
} from "../../helpers/time";
import {applyTooltip} from "../../hooks/useTooltip";
import {getDayTypeFromDate, dayTypes} from "../../helpers/getDayTypeFromDate";
import {createCompositeJourney} from "../../stores/journeyActions";
import Tooltip from "../Tooltip";
import {text} from "../../helpers/text";
import styled from "styled-components";
import {ColoredBackgroundSlot} from "../TagButton";
import {cancelledStyle} from "../commonComponents";
import Timetable from "../../icons/Timetable";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";

const JourneyListRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({selected = false}) => (selected ? "var(--blue)" : "transparent")};
  padding: 0.75rem 1rem;
  border: 0;
  max-width: none;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  color: ${({selected = false}) => (selected ? "white" : "var(--grey)")};
  outline: none;
  position: relative;

  &:nth-child(odd) {
    background: ${({selected = false}) =>
      selected ? "var(--blue)" : "rgba(0, 0, 0, 0.045)"};
  }

  ${cancelledStyle}
`;

const JourneyRowLeft = styled.span`
  display: block;
  font-weight: bold;
  min-width: 7.5rem;
  text-align: left;
  position: relative;
`;

const DelaySlot = styled(ColoredBackgroundSlot)`
  font-size: 0.875rem;
  margin: -2.5px auto -2.5px 0;
  transform: none;
  padding: 5px;
  line-height: 1;
`;

const TimeSlot = styled.span`
  font-size: 0.857rem;
  font-family: "Courier New", Courier, monospace;
  min-width: 4.5rem;
  text-align: right;
`;

const JourneyInstanceDisplay = styled.span`
  margin-left: 0.5rem;
  padding: 2px 4px;
  border-radius: 2px;
  background: var(--lighter-grey);
  min-width: 1.1rem;
  font-size: 0.75rem;
  text-align: center;
  display: inline-block;
  color: var(--dark-grey);
`;

const SpecialDayDisplay = styled(JourneyInstanceDisplay)`
  background: var(--lighter-blue);
  margin-left: ${({largeMargin = false}) => (largeMargin ? "0.5rem" : "0.2rem")};
`;

const TimetableIcon = styled(Timetable)`
  margin-bottom: -3.5px; // Uniform row height
`;

const decorate = flow(
  observer,
  inject("state")
);

const RouteDepartureItem = decorate(
  ({departure, scrollRef, selectJourney, state: {selectedJourney}}) => {
    let matchVehicle =
      get(departure, "journey.uniqueVehicleId") &&
      get(selectedJourney, "uniqueVehicleId");

    let selectedJourneyId = getJourneyId(selectedJourney, matchVehicle);
    const departureDate = departure.plannedDepartureTime.departureDate;
    const departureTime = departure.plannedDepartureTime.departureTime;

    const isFutureJourney = useMemo(
      () => getMomentFromDateTime(departureDate, departureTime).isAfter(new Date()),
      [departureDate, departureTime]
    );

    const isSpecialDayType =
      getDayTypeFromDate(departureDate) !== departure.dayType ||
      !dayTypes.includes(departure.dayType);

    const compositeJourney = useMemo(
      () => createCompositeJourney(departureDate, departure, departureTime),
      [departure]
    );

    let journeyId = getJourneyId(departure.journey, matchVehicle);

    if (!departure.journey) {
      matchVehicle = false;
      selectedJourneyId = getJourneyId(selectedJourney, matchVehicle);
      journeyId = getJourneyId(compositeJourney, matchVehicle);
    }

    const journeyIsSelected = useMemo(() => {
      if (!selectedJourney) {
        return false;
      }

      if (departure.journey) {
        return selectedJourneyId && selectedJourneyId === journeyId;
      }

      return selectedJourneyId === journeyId;
    }, [selectedJourneyId, departure, journeyId]);

    const {isCancelled} = departure;

    if (!departure.journey) {
      return (
        <JourneyListRow
          ref={journeyIsSelected ? scrollRef : null}
          data-testid={`journey-list-row-${departureTime}`}
          key={`planned_journey_row_${journeyId}`}
          selected={journeyIsSelected}
          isCancelled={isCancelled}
          onClick={() => selectJourney(compositeJourney, false)}>
          <Tooltip helpText="Planned journey time">
            <JourneyRowLeft>
              {getNormalTime(departureTime).slice(0, -3)}
              {isSpecialDayType && (
                <SpecialDayDisplay
                  largeMargin={true}
                  {...applyTooltip("Journey day type")}>
                  {departure.dayType}
                </SpecialDayDisplay>
              )}
            </JourneyRowLeft>
          </Tooltip>
          <Tooltip helpText="Journey no data">
            <span>
              {isCancelled ? (
                text("domain.cancelled")
              ) : isFutureJourney ? (
                <TimetableIcon
                  fill="var(--light-grey)"
                  width="1.25rem"
                  height="1.25rem"
                />
              ) : (
                text("filterpanel.journey.no_departure")
              )}
            </span>
          </Tooltip>
        </JourneyListRow>
      );
    }

    const plannedObservedDiff = departure.observedDepartureTime
      ? departure.observedDepartureTime.departureTimeDifference
      : 0;

    const observedTimeString = departure.observedDepartureTime
      ? departure.observedDepartureTime.departureTime
      : "";

    const diffTime = secondsToTimeObject(plannedObservedDiff);
    const delayType = getDelayType(plannedObservedDiff);
    const multipleInstances = departure.journey._numInstance !== 0;

    const observedJourney = observedTimeString ? (
      <>
        <Tooltip helpText="Journey list diff">
          <DelaySlot
            color={delayType === "late" ? "var(--dark-grey)" : "white"}
            backgroundColor={getTimelinessColor(delayType, "var(--light-green)")}>
            {plannedObservedDiff < 0 ? "-" : ""}
            {diffTime.hours ? doubleDigit(diffTime.hours) + ":" : ""}
            {doubleDigit(diffTime.minutes)}:{doubleDigit(diffTime.seconds)}
          </DelaySlot>
        </Tooltip>
        <Tooltip helpText="Journey list observed">
          <TimeSlot>{observedTimeString}</TimeSlot>
        </Tooltip>
      </>
    ) : null;

    return (
      <JourneyListRow
        {...applyTooltip("Journey list row")}
        data-testid={`journey-list-row-${departureTime} observed-journey`}
        ref={journeyIsSelected ? scrollRef : null}
        selected={journeyIsSelected}
        key={`journey_row_${journeyId}_${departure.id}`}
        isCancelled={isCancelled}
        onClick={() => selectJourney(departure.journey, matchVehicle)}>
        <JourneyRowLeft
          data-testid="journey-departure-time"
          {...applyTooltip("Planned journey time with data")}>
          {getNormalTime(departureTime).slice(0, -3)}
          {multipleInstances && (
            <JourneyInstanceDisplay {...applyTooltip("Journey instance")}>
              {departure.journey._numInstance}
            </JourneyInstanceDisplay>
          )}
          {isSpecialDayType && (
            <SpecialDayDisplay
              largeMargin={!multipleInstances}
              {...applyTooltip("Journey day type")}>
              {departure.dayType}
            </SpecialDayDisplay>
          )}
        </JourneyRowLeft>
        {observedJourney}
      </JourneyListRow>
    );
  }
);

export default RouteDepartureItem;
