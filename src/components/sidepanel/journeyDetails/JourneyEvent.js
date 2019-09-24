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
  TimeHeading,
  StopArrivalTime,
  SmallText,
} from "../../StopElements";
import {
  TagButton,
  PlainSlot,
  ColoredBackgroundSlot,
  PlainSlotSmall,
} from "../../TagButton";
import {getTimelinessColor} from "../../../helpers/timelinessColor";
import doubleDigit from "../../../helpers/doubleDigit";
import {text, alertText, Text} from "../../../helpers/text";
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
import format from "date-fns/format";
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
import {getModeColor} from "../../../helpers/vehicleColor";
import CalculateTerminalTime from "./CalculateTerminalTime";

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

export const JourneyEvent = decorate(
  ({event, color, date, isFirst, isLast, onSelectTime, state}) => {
    const timestamp = moment.tz(event.recordedAt, TIMEZONE);

    const selectTime = useCallback(() => onSelectTime(journeyEventTime(event, date)), [
      timestamp,
    ]);

    return (
      <StopWrapper>
        <StopElementsWrapper
          color={color}
          terminus={isFirst ? "origin" : isLast ? "destination" : undefined}>
          <StopMarker color={color} />
        </StopElementsWrapper>
        <StopContent>
          <StopTime onClick={selectTime}>
            <PlainSlot
              lang={state.language}
              {...applyTooltip(event.type)}
              dangerouslySetInnerHTML={{
                __html: text(`journey.event.${event.type}`, state.language),
              }}
            />
            <PlainSlotSmall style={{marginLeft: "auto"}}>
              {timestamp.format("HH:mm:ss")}
            </PlainSlotSmall>
          </StopTime>
        </StopContent>
      </StopWrapper>
    );
  }
);

export const JourneyStopEvent = decorate(
  ({
    event,
    onSelectTime,
    onClick = () => {},
    onHover = () => {},
    state,
    date,
    departure,
    isFirst,
    isLast,
  }) => {
    const plannedTime = get(event, "plannedTime", "");
    const observedTime = get(event, "recordedTime");

    const selectTime = useCallback(() => onSelectTime(observedTime || plannedTime), [
      plannedTime,
      observedTime,
    ]);

    const stop = get(event, "stop", {stopId: ""});
    const color = getModeColor(event.mode);

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
          <StopElementsWrapper
            color={color}
            terminus={isFirst ? "origin" : isLast ? "destination" : undefined}>
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
        <StopElementsWrapper
          color={color}
          terminus={isFirst ? "origin" : isLast ? "destination" : undefined}>
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
          {/* TODO: Show doors opened and stopped status */}
          {isFirst && event.type === "ARR" ? (
            <CalculateTerminalTime date={date} departure={departure} event={event}>
              {({offsetTime, wasLate, diffMinutes, diffSeconds, sign}) => (
                <>
                  <StopArrivalTime onClick={selectTime}>
                    <PlainSlot
                      style={{
                        fontStyle: "italic",
                        fontSize: "0.925rem",
                        lineHeight: "1.2rem",
                      }}>
                      {offsetTime.format("HH:mm:ss")}*
                    </PlainSlot>
                    <ColoredBackgroundSlot
                      color="white"
                      backgroundColor={wasLate ? "var(--red)" : "var(--light-green)"}>
                      {sign === "-" ? "-" : ""}
                      {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                    </ColoredBackgroundSlot>
                    <PlainSlotSmall>{getNormalTime(observedTime)}</PlainSlotSmall>
                  </StopArrivalTime>
                  <SmallText>
                    * <Text>journey.departure_minus_terminal</Text>
                  </SmallText>
                </>
              )}
            </CalculateTerminalTime>
          ) : isLast && event.type === "ARR" ? (
            <CalculateTerminalTime
              recovery={true}
              date={date}
              departure={departure}
              event={event}>
              {({offsetTime, wasLate, diffMinutes, diffSeconds, sign}) => (
                <>
                  <TimeHeading>
                    <Text>journey.arrival</Text>
                  </TimeHeading>
                  <StopArrivalTime onClick={selectTime}>
                    <PlainSlot>{offsetTime.format("HH:mm:ss")}</PlainSlot>
                    <ColoredBackgroundSlot
                      color="white"
                      backgroundColor={wasLate ? "var(--red)" : "var(--light-green)"}>
                      {sign === "-" ? "-" : ""}
                      {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                    </ColoredBackgroundSlot>
                    <PlainSlotSmall>{getNormalTime(observedTime)}</PlainSlotSmall>
                  </StopArrivalTime>
                </>
              )}
            </CalculateTerminalTime>
          ) : (
            <StopTime onClick={selectTime}>
              <PlainSlot>{getNormalTime(event.plannedTime)}</PlainSlot>
              <ColoredBackgroundSlot
                color={delayType === "late" ? "var(--dark-grey)" : "white"}
                backgroundColor={getTimelinessColor(delayType, "var(--light-green)")}>
                {diffObject.hours > 0 ? doubleDigit(diffObject.hours) + ":" : ""}
                {doubleDigit(get(diffObject, "minutes", 0))}:
                {doubleDigit(get(diffObject, "seconds", 0))}
              </ColoredBackgroundSlot>
              <PlainSlotSmall>{getNormalTime(observedTime)}</PlainSlotSmall>
            </StopTime>
          )}
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
      margin-left: 1px;
      margin-top: 0.75rem;
    }
  }

  ${({isFirst = false}) =>
    isFirst
      ? css`
          ${StopElementsWrapper} {
            margin-top: 1.5rem;

            svg {
              margin-top: -0.875rem;
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

export const JourneyCancellationEventItem = decorate(
  ({event, isFirst, isLast, state}) => {
    const timestamp = moment.tz(event.recordedAt, TIMEZONE);

    return (
      <CancellationWrapper isFirst={isFirst} isLast={isLast}>
        <StopElementsWrapper>
          {event.isCancelled ? (
            <CrossThick fill="var(--red)" width="1.3rem" />
          ) : (
            <CircleCheckmark fill={{outer: "var(--green)"}} width="1.3rem" />
          )}
        </StopElementsWrapper>
        <StopCancellation>
          <CancellationHeader>
            <Row>
              {event.title && event.title.trim() !== "-" ? (
                <>
                  <CancellationTitle>{event.title}</CancellationTitle>
                  <CancellationTime>
                    {format(event.plannedDate, "DD/MM")} {event.plannedTime}
                  </CancellationTime>
                </>
              ) : (
                <CancellationTitle>
                  {format(event.plannedDate, "DD/MM")} {event.plannedTime}
                </CancellationTitle>
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
  }
);
