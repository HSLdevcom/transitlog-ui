import React, {useCallback} from "react";
import get from "lodash/get";
import styled, {css} from "styled-components";
import {
  StopElementsWrapper,
  StopMarker,
  TimingStopMarker,
  StopWrapper as DefaultStopWrapper,
  StopContent,
  StopHeading,
} from "../../StopElements";
import {
  TagButton,
  PlainSlot,
  ColoredBackgroundSlot,
  PlainSlotSmall,
} from "../../TagButton";
import {getTimelinessColor} from "../../../helpers/timelinessColor";
import doubleDigit from "../../../helpers/doubleDigit";
import {text, alertText} from "../../../helpers/text";
import {
  getNormalTime,
  secondsToTimeObject,
  journeyEventTime,
} from "../../../helpers/time";
import getDelayType from "../../../helpers/getDelayType";
import {applyTooltip} from "../../../hooks/useTooltip";
import {observer} from "mobx-react-lite";
import CrossThick from "../../../icons/CrossThick";
import CircleCheckmark from "../../../icons/CircleCheckmark";
import {
  CancellationHeader,
  CancellationContent,
  CancellationTitle,
  CancellationDescription,
  CancellationInfo,
  CancellationInfoRow,
  CancellationFooter,
  CancellationPublishTime,
  Row,
  CancellationTime,
} from "../../CancellationItem";
import flow from "lodash/flow";
import {inject} from "../../../helpers/inject";
import {TIMEZONE} from "../../../constants";
import moment from "moment-timezone";

const StopWrapper = styled(DefaultStopWrapper)`
  padding: 0;
`;

const EventTypeHeading = styled.span`
  display: block;
  margin-top: 0.25rem;
  color: var(--dark-grey);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
`;

const EventHeadingButton = styled(StopHeading)`
  margin-bottom: 0.5rem;
  margin-left: 0;
`;

const StopTime = styled(TagButton)``;

const decorate = flow(
  observer,
  inject("state")
);

export const JourneyEvent = decorate(({event, color, date, onSelectTime, state}) => {
  const timestamp = moment.tz(event.recordedAt, TIMEZONE);

  const selectTime = useCallback(() => onSelectTime(journeyEventTime(event, date)), [
    timestamp,
  ]);

  return (
    <StopWrapper>
      <StopElementsWrapper color={color}>
        <StopMarker color={color} />
      </StopElementsWrapper>
      <StopContent>
        <StopTime onClick={selectTime}>
          <PlainSlot>{text(`journey.event.${event.type}`, state.language)}</PlainSlot>
          <PlainSlotSmall style={{marginLeft: "auto"}}>
            {timestamp.format("HH:mm:ss")}
          </PlainSlotSmall>
        </StopTime>
      </StopContent>
    </StopWrapper>
  );
});

export const JourneyStopEvent = decorate(
  ({event, color, onSelectTime, onClick = () => {}, onHover = () => {}, state}) => {
    const plannedTime = get(event, "plannedTime", "");
    const observedTime = get(event, "recordedTime");

    const selectTime = useCallback(() => onSelectTime(observedTime || plannedTime), [
      plannedTime,
      observedTime,
    ]);

    const stop = get(event, "stop", {stopId: ""});

    const selectWithStopId = useCallback(() => onClick(stop.stopId), [stop.stopId]);
    const hoverWithStopId = useCallback(() => onHover(stop.stopId), [stop.stopId]);
    const hoverReset = useCallback(() => onHover(""), []);

    const onStopClick = useCallback(() => {
      selectWithStopId();
      plannedTime && selectTime();
    });

    const hoverProps = {
      onMouseEnter: hoverWithStopId,
      onMouseLeave: hoverReset,
    };

    if (!event || !event.stop) {
      return null;
    }

    if (event.type === "PLANNED") {
      return (
        <StopWrapper>
          <StopElementsWrapper color={color}>
            {event.isTimingStop ? (
              <TimingStopMarker color={color} onClick={onStopClick} {...hoverProps} />
            ) : (
              <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
            )}
          </StopElementsWrapper>
          <StopContent {...hoverProps}>
            <EventHeadingButton onClick={onStopClick} {...applyTooltip("Focus on stop")}>
              <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")}
              )
            </EventHeadingButton>
            <EventTypeHeading>
              {text(`journey.event.${event.type}`, state.language)}
            </EventTypeHeading>
            <StopTime onClick={selectTime}>
              <PlainSlot>{getNormalTime(plannedTime)}</PlainSlot>
            </StopTime>
          </StopContent>
        </StopWrapper>
      );
    }

    const timeDiff = event.plannedTimeDifference;
    const delayType = getDelayType(timeDiff);
    const diffObject = secondsToTimeObject(timeDiff);

    return (
      <StopWrapper>
        <StopElementsWrapper color={color}>
          {event.isTimingStop ? (
            <TimingStopMarker color={color} onClick={onStopClick} {...hoverProps} />
          ) : (
            <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
          )}
        </StopElementsWrapper>
        <StopContent {...hoverProps}>
          <EventHeadingButton onClick={onStopClick} {...applyTooltip("Focus on stop")}>
            <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")})
          </EventHeadingButton>
          <EventTypeHeading>
            {text(`journey.event.${event.type}`, state.language)}
          </EventTypeHeading>
          <StopTime onClick={selectTime}>
            <PlainSlot>{getNormalTime(event.plannedTime)}</PlainSlot>
            <ColoredBackgroundSlot
              color={delayType === "late" ? "var(--dark-grey)" : "white"}
              backgroundColor={getTimelinessColor(delayType, "var(--light-green)")}>
              {diffObject.hours > 0 ? doubleDigit(diffObject.hours) + ":" : ""}
              {doubleDigit(get(diffObject, "minutes", 0))}:
              {doubleDigit(get(diffObject, "seconds", 0))}
            </ColoredBackgroundSlot>
            <PlainSlotSmall>{getNormalTime(event.recordedTime)}</PlainSlotSmall>
          </StopTime>
        </StopContent>
      </StopWrapper>
    );
  }
);

const CancellationWrapper = styled(StopWrapper)`
  padding: 0;
  width: auto;

  ${StopElementsWrapper} {
    margin-right: 0.5rem;

    svg {
      margin-top: 0.75rem;
    }
  }

  ${({isFirst = false}) =>
    isFirst
      ? css`
          ${StopElementsWrapper} {
            margin-top: 1.5rem;

            svg {
              margin-top: -0.72rem;
            }
          }
        `
      : ""}
`;

const StopCancellation = styled.div`
  background: transparent !important;
  font-family: var(--font-family);
  width: 100%;
  color: var(--dark-grey);
  margin-bottom: 0.75rem;
  border-bottom: 0;
`;

export const JourneyCancellationEventItem = decorate(({event, isFirst, state}) => {
  const timestamp = moment.tz(event.recordedAt, TIMEZONE);

  return (
    <CancellationWrapper isFirst={isFirst}>
      <StopElementsWrapper>
        {event.isCancelled ? (
          <CrossThick fill="var(--red)" width="1rem" />
        ) : (
          <CircleCheckmark fill={{outer: "var(--green)"}} width="1.2rem" />
        )}
      </StopElementsWrapper>
      <StopCancellation>
        <CancellationHeader>
          <Row>
            <CancellationTime>{timestamp.format("DD/MM HH:mm")}</CancellationTime>
            {event.title && event.title.trim() !== "-" && (
              <CancellationTitle>{event.title}</CancellationTitle>
            )}
          </Row>
        </CancellationHeader>
        <CancellationContent>
          {event.description && event.description.trim() !== "-" && (
            <CancellationDescription>{event.description}</CancellationDescription>
          )}
          <CancellationInfo>
            {event.category !== "HIDDEN" && (
              <>
                <CancellationInfoRow>
                  {text("general.category")}:{" "}
                  <strong>
                    {alertText("category." + event.category, state.language)}
                  </strong>
                </CancellationInfoRow>
                <CancellationInfoRow>
                  {text("general.subcategory")}:{" "}
                  <strong>
                    {alertText("subCategory." + event.subCategory, state.language)}
                  </strong>
                </CancellationInfoRow>
              </>
            )}
            <CancellationInfoRow>
              {text("general.type")}:{" "}
              <strong>
                {alertText("cancelType." + event.cancellationType, state.language)}
              </strong>
            </CancellationInfoRow>
            <CancellationInfoRow>
              {text("general.impact")}:{" "}
              <strong>
                {alertText("cancelEffect." + event.cancellationEffect, state.language)}
              </strong>
            </CancellationInfoRow>
          </CancellationInfo>
          <CancellationFooter>
            <CancellationPublishTime>
              {timestamp.format("DD/MM HH:mm")}
            </CancellationPublishTime>
          </CancellationFooter>
        </CancellationContent>
      </StopCancellation>
    </CancellationWrapper>
  );
});
