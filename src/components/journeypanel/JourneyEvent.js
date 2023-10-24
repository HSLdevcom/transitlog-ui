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
} from "../StopElements";
import {TagButton, PlainSlot, ColoredBackgroundSlot, PlainSlotMono} from "../TagButton";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import doubleDigit from "../../helpers/doubleDigit";
import {text, alertText, Text} from "../../helpers/text";
import {getNormalTime, secondsToTimeObject, journeyEventTime} from "../../helpers/time";
import getDelayType, {getDelayStopType} from "../../helpers/getDelayType";
import {applyTooltip} from "../../hooks/useTooltip";
import {observer} from "mobx-react-lite";
import CrossThick from "../../icons/CrossThick";
import CircleCheckmark from "../../icons/CircleCheckmark";
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
} from "../CancellationItem";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import {TIMEZONE} from "../../constants";
import moment from "moment-timezone";
import CalculateTerminalTime from "./CalculateTerminalTime";
import RoutesFail from "../../icons/RoutesFail";
import Tooltip from "../Tooltip";

import {legacyParse, convertTokens} from "@date-fns/upgrade/v2";
import {LocBadge} from "../commonComponents";

const StopWrapper = styled(DefaultStopWrapper)`
  padding: 0;
`;

const EventTypeHeading = styled.span`
  display: flex;
  align-items: baseline;
  margin-top: 0.25rem;
  color: var(--dark-grey);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
`;

const EventTextSmall = styled.span`
  display: block;
  margin-top: -0.3rem;
  color: var(--grey);
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
`;

const EventHeadingButton = styled(StopHeading)`
  margin-bottom: 0.5rem;
  margin-left: 0;
`;

const IconBackground = styled.div`
  background: white;
  width: 2rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AlignedLocBadge = styled(LocBadge)`
  margin-left: auto;
`;

const AlignedPlainSlotMono = styled(PlainSlotMono)`
  margin-left: 0;
`;

const StopTime = styled(TagButton)``;

const zeroOrNonNull = (property) => property || property === 0;

const decorate = flow(observer, inject("state"));

export const JourneyEvent = decorate(
  ({event, color, date, isFirst, isLast, onSelectTime}) => {
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
            <PlainSlot {...applyTooltip(event.type)}>
              <span>
                {text(`journey.event.${event.type}`)}
                {event.stopId ? ` (${event.stopId})` : ""}
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--grey)",
                    marginLeft: "0.5rem",
                  }}>
                  {event.type}
                </span>
              </span>
            </PlainSlot>
            <div style={{paddingTop: "0.15rem"}}>
              <AlignedLocBadge red={event.type !== "PDE" && event.loc === "ODO"}>
                {event.loc}
              </AlignedLocBadge>
              <AlignedPlainSlotMono>{timestamp.format("HH:mm:ss")}</AlignedPlainSlotMono>
            </div>
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
    date,
    departure,
    isFirst,
    isLast,
    isOrigin,
    color,
    doorsWorking = true,
  }) => {
    const plannedTime = get(event, "plannedTime", "");
    const observedTime = get(event, "recordedTime");

    const selectTime = useCallback(() => onSelectTime(observedTime || plannedTime), [
      plannedTime,
      observedTime,
    ]);

    let stop = get(event, "stop");

    if (!stop) {
      stop = {stopId: get(event, "stopId", "")};
    }

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

    if (!event) {
      return null;
    }

    const stopId = get(stop, "stopId", event.stopId);
    const stopName = get(stop, "name");
    const stopShortId = get(stop, "shortId", "").replace(/ /g, "");

    if (event.type === "PLANNED") {
      return (
        <StopWrapper data-testid="journey-stop-event planned-stop-event">
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
              {stopName && <strong>{stopName}</strong>} {stopId}{" "}
              {stopShortId && `(${stopShortId})`}
            </EventHeadingButton>
            <EventTypeHeading>{text(`journey.event.${event.type}`)}</EventTypeHeading>
            <StopTime onClick={selectTime}>
              <PlainSlot>{getNormalTime(plannedTime)}</PlainSlot>
            </StopTime>
          </StopContent>
        </StopWrapper>
      );
    }

    const timeDiff = event.plannedTimeDifference;
    const delayType = getDelayType(timeDiff, getDelayStopType(event));
    const diffObject = secondsToTimeObject(timeDiff);
    let timeDiffColor = getTimelinessColor(delayType, "var(--light-green)");

    if (event.isTimingStop && event.type === "ARS") {
      timeDiffColor = "var(--light-green)";
    }

    return (
      <StopWrapper data-testid="journey-stop-event">
        <StopElementsWrapper
          color={color}
          terminus={isFirst ? "origin" : isLast ? "destination" : undefined}>
          {event.isTimingStop ? (
            <TimingStopMarker color={color} onClick={onStopClick} {...hoverProps} />
          ) : event.unplannedStop ? (
            <IconBackground>
              <RoutesFail width="1.875rem" />
            </IconBackground>
          ) : (
            <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
          )}
        </StopElementsWrapper>
        <StopContent {...hoverProps}>
          <EventHeadingButton onClick={onStopClick} {...applyTooltip("Focus on stop")}>
            {stopName && <strong>{stopName}</strong>} {stopId}{" "}
            {stopShortId && `(${stopShortId})`}
          </EventHeadingButton>
          <EventTypeHeading>
            {text(`journey.event.${event.type}`)}{" "}
            <span
              style={{fontSize: "0.75rem", color: "var(--grey)", marginLeft: "0.5rem"}}>
              {event.type}
            </span>
            <Tooltip helpText={text(`loc.${event.loc}`)}>
              <LocBadge red={event.type !== "PDE" && event.loc === "ODO"}>
                {event.loc}
              </LocBadge>
            </Tooltip>
          </EventTypeHeading>
          {event.doorsOpened === false && (
            <EventTextSmall>
              {text(
                doorsWorking
                  ? `journey.event.doors_not_open`
                  : `journey.event.doors_not_working`
              )}
            </EventTextSmall>
          )}
          {event.stopped === false && (
            <EventTextSmall>{text(`journey.event.vehicle_not_stopped`)}</EventTextSmall>
          )}
          {isOrigin && departure && event.type === "ARS" ? (
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
                    <PlainSlotMono>{getNormalTime(observedTime)}</PlainSlotMono>
                  </StopArrivalTime>
                  <SmallText>
                    * <Text>journey.departure_minus_terminal</Text>
                  </SmallText>
                </>
              )}
            </CalculateTerminalTime>
          ) : isLast && departure && event.type === "ARS" ? (
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
                    <PlainSlotMono>{getNormalTime(observedTime)}</PlainSlotMono>
                  </StopArrivalTime>
                </>
              )}
            </CalculateTerminalTime>
          ) : (
            <StopTime onClick={selectTime}>
              <PlainSlot>
                {event.plannedTime
                  ? getNormalTime(event.plannedTime)
                  : text("general.unknown")}
              </PlainSlot>
              <ColoredBackgroundSlot
                color={timeDiffColor === "var(--yellow)" ? "var(--dark-grey)" : "white"}
                backgroundColor={timeDiffColor}>
                {diffObject.hours > 0 ? doubleDigit(diffObject.hours) + ":" : ""}
                {doubleDigit(get(diffObject, "minutes", 0))}:
                {doubleDigit(get(diffObject, "seconds", 0))}
              </ColoredBackgroundSlot>
              <PlainSlotMono>{getNormalTime(observedTime)}</PlainSlotMono>
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

export const JourneyCancellationEventItem = decorate(({event, isFirst, isLast}) => {
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
                  {format(legacyParse(event.plannedDate), convertTokens("DD/MM"))}{" "}
                  {event.plannedTime}
                </CancellationTime>
              </>
            ) : (
              <CancellationTitle>
                {format(legacyParse(event.plannedDate), convertTokens("DD/MM"))}{" "}
                {event.plannedTime}
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
                  <strong>{alertText("category." + event.category)}</strong>
                </CancellationInfoRow>
                <CancellationInfoRow>
                  {text("general.subcategory")}:{" "}
                  <strong>{alertText("subCategory." + event.subCategory)}</strong>
                </CancellationInfoRow>
              </>
            )}
            <CancellationInfoRow>
              {text("general.type")}:{" "}
              <strong>{alertText("cancelType." + event.cancellationType)}</strong>
            </CancellationInfoRow>
            <CancellationInfoRow>
              {text("general.impact")}:{" "}
              <strong>{alertText("cancelEffect." + event.cancellationEffect)}</strong>
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

const TlpDetailsWrapper = styled.div`
  padding: 4px;
  font-size: 0.765rem;
  color: var(--grey);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  line-height: 1.7;
`;
const TlpPropertyBox = styled.div`
  padding: 0 12px 0 0px;
`;
const TlpPropertyValue = styled.span`
  color: ${(props) => (props.color ? props.color : "var(--blue)")};
`;

const getTlpDecisionColor = (decision) =>
  decision === "ACK" ? "var(--green)" : decision === "NAK" ? "var(--red)" : "var(--blue)";

export const JourneyTlpEvent = decorate(
  ({event, color, date, isFirst, isLast, onSelectTime}) => {
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
            <PlainSlot {...applyTooltip(event.type)}>
              <span
                dangerouslySetInnerHTML={{
                  __html: text(`journey.event.${event.type}`),
                }}
              />
            </PlainSlot>
            <AlignedLocBadge red={event.type !== "PDE" && event.loc === "ODO"}>
              {event.loc}
            </AlignedLocBadge>
            <AlignedPlainSlotMono>{timestamp.format("HH:mm:ss")}</AlignedPlainSlotMono>
          </StopTime>
          <TlpDetailsWrapper>
            {zeroOrNonNull(event.junctionId) && (
              <TlpPropertyBox>
                {text("tlp.junctionid")}:{" "}
                <TlpPropertyValue>{event.junctionId}</TlpPropertyValue>
              </TlpPropertyBox>
            )}
            {zeroOrNonNull(event.requestId) && (
              <TlpPropertyBox>
                {text("tlp.requestid")}:{" "}
                <TlpPropertyValue>{event.requestId}</TlpPropertyValue>
              </TlpPropertyBox>
            )}
            {event.decision && (
              <TlpPropertyBox>
                {text("tlp.decision")}:{" "}
                <TlpPropertyValue color={getTlpDecisionColor(event.decision)}>
                  {event.decision}
                </TlpPropertyValue>
              </TlpPropertyBox>
            )}
            {zeroOrNonNull(event.attemptSeq) && (
              <TlpPropertyBox>
                {text("tlp.attempt")}:{" "}
                <TlpPropertyValue>{event.attemptSeq}</TlpPropertyValue>
              </TlpPropertyBox>
            )}
            {event.requestType && (
              <TlpPropertyBox>
                {text("tlp.type")}:{" "}
                <TlpPropertyValue>{event.requestType.toLowerCase()}</TlpPropertyValue>
              </TlpPropertyBox>
            )}
            {event.priorityLevel && (
              <TlpPropertyBox>
                {text("tlp.priority")}:{" "}
                <TlpPropertyValue>{event.priorityLevel.toLowerCase()}</TlpPropertyValue>
              </TlpPropertyBox>
            )}
            {event.reason && (
              <TlpPropertyBox>
                {text("tlp.reason")}:{" "}
                <TlpPropertyValue>{event.reason.toLowerCase()}</TlpPropertyValue>
              </TlpPropertyBox>
            )}
            {zeroOrNonNull(event.signalGroupNbr) && (
              <TlpPropertyBox>
                {text("tlp.signalgroupnbr")}:{" "}
                <TlpPropertyValue>{event.signalGroupNbr}</TlpPropertyValue>
              </TlpPropertyBox>
            )}
          </TlpDetailsWrapper>
        </StopContent>
      </StopWrapper>
    );
  }
);

export const JourneyApcEvent = decorate(
  ({event, color, date, isFirst, isLast, onSelectTime}) => {
    const timestamp = moment.tz(event.recordedAt, TIMEZONE);

    const selectTime = useCallback(() => onSelectTime(journeyEventTime(event, date)), [
      timestamp,
    ]);
    let vehicledLoadRatio = text(`apc.${event.vehicleLoadRatioText}`);
    if (event.vehicleLoadRatio === 0 || event.vehicleLoadRatio > 0) {
      vehicledLoadRatio = `${(100 * event.vehicleLoadRatio).toFixed()}%`;
    }
    let vehicleLoadRatioColor =
      event.vehicleLoadRatio > 0 ? "var(--blue)" : "var(--grey)";

    return (
      <StopWrapper>
        <StopElementsWrapper
          color={color}
          terminus={isFirst ? "origin" : isLast ? "destination" : undefined}>
          <StopMarker color={color} />
        </StopElementsWrapper>
        <StopContent>
          <StopTime onClick={selectTime}>
            <PlainSlot {...applyTooltip(event.type)}>
              <span
                dangerouslySetInnerHTML={{
                  __html: text(`journey.event.${event.type}`),
                }}
              />
            </PlainSlot>
            <AlignedLocBadge>{event.type}</AlignedLocBadge>
            <AlignedPlainSlotMono>{timestamp.format("HH:mm:ss")}</AlignedPlainSlotMono>
          </StopTime>
          <TlpDetailsWrapper>
            {(event.totalPassengersIn || event.totalPassengersIn == 0) && (
              <TlpPropertyBox>
                {text("apc.totalPassengersIn")}:{" "}
                <TlpPropertyValue>{event.totalPassengersIn}</TlpPropertyValue>
              </TlpPropertyBox>
            )}
            {(event.totalPassengersOut || event.totalPassengersOut == 0) && (
              <TlpPropertyBox>
                {text("apc.totalPassengersOut")}:{" "}
                <TlpPropertyValue>{event.totalPassengersOut}</TlpPropertyValue>
              </TlpPropertyBox>
            )}
            {(event.vehicleLoad || event.vehicleLoad == 0) && (
              <TlpPropertyBox>
                {text("apc.vehicleLoad")}:{" "}
                <TlpPropertyValue>{event.vehicleLoad}</TlpPropertyValue>
              </TlpPropertyBox>
            )}
            {vehicledLoadRatio && (
              <TlpPropertyBox>
                {text("apc.vehicleLoadRatio")}:{" "}
                <TlpPropertyValue color={vehicleLoadRatioColor}>
                  {vehicledLoadRatio}
                </TlpPropertyValue>
              </TlpPropertyBox>
            )}
          </TlpDetailsWrapper>
        </StopContent>
      </StopWrapper>
    );
  }
);
