import React from "react";
import {Heading} from "../../Typography";
import get from "lodash/get";
import isWithinRange from "date-fns/is_within_range";
import orderBy from "lodash/orderBy";
import {getDayTypeFromDate} from "../../../helpers/getDayTypeFromDate";
import {stopTimes as getStopTimes} from "../../../helpers/stopTimes";
import styled from "styled-components";
import {SmallText, StopElementsWrapper, StopMarker} from "./elements";
import {
  TagButton,
  PlainSlot,
  ColoredBackgroundSlot,
  PlainSlotSmallRight,
} from "../../TagButton";
import {transportColor} from "../../transportModes";
import {getTimelinessColor} from "../../../helpers/timelinessColor";
import doubleDigit from "../../../helpers/doubleDigit";
import CalculateTerminalTime from "./CalculateTerminalTime";
import ArrowRightLong from "../../../icons/ArrowRightLong";

const StopWrapper = styled.div`
  padding: 0 1rem 0 0;
  margin-left: 1.75rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const StopContent = styled.div`
  padding: 0 1.75rem 1rem 0.75rem;
  width: 100%;
`;

const StopHeading = styled(Heading).attrs({level: 5})`
  margin-top: 0.2rem;
  color: var(--dark-grey);
  font-size: 0.875rem;
  font-weight: normal;
`;

const TimeHeading = styled.div`
  font-size: 0.75rem;
  color: var(--light-grey);
  margin-bottom: 0.2rem;
`;

const StopArrivalTime = styled(TagButton)`
  margin: 0 0 0.5rem;
`;

const SimpleStopArrivalTime = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: var(--dark-grey);
  font-size: 0.875rem;

  svg {
    margin-right: 0.5rem;
  }
`;

const StopDepartureTime = styled(TagButton)``;

export default ({
  stop,
  originDeparture,
  isFirstTerminal,
  isLastTerminal,
  journeyPositions,
  date,
  onClickTime,
  // The origin stop times are needed in other places too,
  // so we can get it here if it has already been calculated.
  stopTimes: precalculatedStopTimes,
}) => {
  let stopTimes = null;

  if (precalculatedStopTimes) {
    stopTimes = precalculatedStopTimes;
  } else if (stop.departures && stop.departures.nodes.length !== 0) {
    const firstPosition = journeyPositions[0];
    const dayType = getDayTypeFromDate(date);

    const stopPositions = orderBy(
      journeyPositions.filter((pos) => pos.next_stop_id === stop.stopId),
      "received_at_unix",
      "desc"
    );

    const stopDepartures = get(stop, "departures.nodes", []).filter(
      (departure) =>
        isWithinRange(date, departure.dateBegin, departure.dateEnd) &&
        departure.dayType === dayType &&
        departure.routeId === firstPosition.route_id &&
        parseInt(departure.direction) ===
          parseInt(get(firstPosition, "direction_id", 0))
    );

    stopTimes = getStopTimes(originDeparture, stopPositions, stopDepartures, date);
  }

  const stopMode = get(stop, "modes.nodes[0]", "BUS");
  const stopColor = get(transportColor, stopMode, "var(--light-grey)");

  // Bail here if we don't have data about stop arrival and departure times.
  if (!stopTimes) {
    return (
      <StopWrapper>
        <StopElementsWrapper color={stopColor}>
          <StopMarker color={stopColor} />
        </StopElementsWrapper>
        <StopContent>
          <StopHeading>
            {stop.stopId} ({stop.shortId}) - {stop.nameFi}
          </StopHeading>
        </StopContent>
      </StopWrapper>
    );
  }

  const {
    departure,
    departureEvent,
    plannedDepartureMoment,
    departureMoment,
    arrivalEvent,
    arrivalMoment,
    plannedArrivalMoment,
    departureDelayType,
    departureDiff,
  } = stopTimes;

  let showPlannedArrivalTime = !plannedDepartureMoment.isSame(plannedArrivalMoment);

  const endOfStream =
    get(departureEvent, "received_at_unix", 0) ===
    get(journeyPositions, `[${journeyPositions.length - 1}].received_at_unix`, 0);

  const stopArrivalTime = arrivalMoment.format("HH:mm:ss");
  const stopDepartureTime = departureMoment.format("HH:mm:ss");

  return (
    <StopWrapper>
      <StopElementsWrapper
        color={stopColor}
        terminus={
          isFirstTerminal ? "origin" : isLastTerminal ? "destination" : false
        }>
        <StopMarker color={stopColor} />
      </StopElementsWrapper>
      <StopContent
        terminus={
          isFirstTerminal ? "origin" : isLastTerminal ? "destination" : false
        }>
        <StopHeading>
          {stop.stopId} ({stop.shortId}) - {stop.nameFi}
        </StopHeading>
        {isFirstTerminal ? (
          <CalculateTerminalTime
            date={date}
            departure={departure}
            event={arrivalEvent}>
            {({offsetTime, wasLate, diffMinutes, diffSeconds, sign}) => (
              <>
                <TimeHeading>Arrival</TimeHeading>
                <StopArrivalTime onClick={onClickTime(stopArrivalTime)}>
                  <PlainSlot>{offsetTime.format("HH:mm:ss")}</PlainSlot>
                  <ColoredBackgroundSlot
                    color="white"
                    backgroundColor={wasLate ? "var(--red)" : "var(--light-green)"}>
                    {sign}
                    {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                  </ColoredBackgroundSlot>
                  <PlainSlotSmallRight>{stopArrivalTime}</PlainSlotSmallRight>
                </StopArrivalTime>
              </>
            )}
          </CalculateTerminalTime>
        ) : (
          <SimpleStopArrivalTime>
            <ArrowRightLong fill="var(--blue)" width="0.75rem" height="0.75rem" />
            {arrivalMoment.format("HH:mm:ss")}
          </SimpleStopArrivalTime>
        )}
        {isFirstTerminal && <TimeHeading>Departure</TimeHeading>}
        <StopDepartureTime onClick={onClickTime(stopDepartureTime)}>
          <PlainSlot>{plannedDepartureMoment.format("HH:mm:ss")}</PlainSlot>
          <ColoredBackgroundSlot
            color={departureDelayType === "late" ? "var(--dark-grey)" : "white"}
            backgroundColor={getTimelinessColor(
              departureDelayType,
              "var(--light-green)"
            )}>
            {departureDiff.sign}
            {doubleDigit(get(departureDiff, "minutes", 0))}:
            {doubleDigit(get(departureDiff, "seconds", 0))}
          </ColoredBackgroundSlot>
          <PlainSlotSmallRight>
            {departureMoment.format("HH:mm:ss")}
          </PlainSlotSmallRight>
        </StopDepartureTime>
        {endOfStream && (
          <SmallText>End of HFP stream used as stop departure.</SmallText>
        )}
      </StopContent>
    </StopWrapper>
  );
};
