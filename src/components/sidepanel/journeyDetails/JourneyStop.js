import React from "react";
import {Heading} from "../../Typography";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import {stopTimes} from "../../../helpers/stopTimes";
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
import ArrowRightLong from "../../../icons/ArrowRightLong";

const StopWrapper = styled.div`
  padding: 0;
  margin-left: 0.25rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const StopContent = styled.div`
  padding: 0 1.75rem
    ${({terminus = "destination"}) =>
      terminus === "destination" ? "1rem" : "0.25rem"}
    0.75rem;
  width: 100%;
`;

const StopHeading = styled(Heading).attrs({level: 5})`
  margin-top: 0.2rem;
  color: var(--dark-grey);
  font-size: 0.875rem;
  font-weight: normal;
`;

const StopArrivalTime = styled.div`
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
  journeyPositions = [],
  date,
  onClickTime,
}) => {
  const stopPositions = orderBy(
    journeyPositions.filter((pos) => pos.next_stop_id === stop.stopId),
    "received_at_unix",
    "desc"
  );

  const departure = stop.stopDeparture;

  const stopMode = get(stop, "modes.nodes[0]", "BUS");
  const stopColor = get(transportColor, stopMode, "var(--light-grey)");

  if (!departure) {
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
    departureEvent,
    plannedDepartureMoment,
    departureMoment,
    arrivalMoment,
    plannedArrivalMoment,
    departureDelayType,
    departureDiff,
  } = stopTimes(originDeparture, stopPositions, departure, date);

  const endOfStream =
    get(departureEvent, "received_at_unix", 0) ===
    get(journeyPositions, `[${journeyPositions.length - 1}].received_at_unix`, 0);

  const stopDepartureTime = departureMoment.format("HH:mm:ss");

  let showPlannedArrivalTime = !plannedDepartureMoment.isSame(plannedArrivalMoment);
  console.log(
    plannedArrivalMoment.format("HH:mm:ss"),
    plannedDepartureMoment.format("HH:mm:ss")
  );

  return (
    <StopWrapper>
      <StopElementsWrapper color={stopColor}>
        <StopMarker color={stopColor} />
      </StopElementsWrapper>
      <StopContent>
        <StopHeading>
          {stop.stopId} ({stop.shortId}) - {stop.nameFi}
        </StopHeading>
        <StopArrivalTime>
          <ArrowRightLong fill="var(--blue)" width="0.75rem" height="0.75rem" />
          {arrivalMoment.format("HH:mm:ss")}
        </StopArrivalTime>
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
