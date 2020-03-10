import React, {useRef} from "react";
import {Tooltip} from "react-leaflet";
import moment from "moment-timezone";
import {observer} from "mobx-react-lite";
import {TIMEZONE} from "../../constants";
import BusStop from "../../icons/BusStop";
import styled from "styled-components";
import flow from "lodash/flow";
import get from "lodash/get";
import {inject} from "../../helpers/inject";
import Time2 from "../../icons/Time2";
import Bus from "../../icons/Bus";
import Envelope from "../../icons/Envelope";
import RealTime2 from "../../icons/RealTime2";
import BusLine from "../../icons/BusLine";
import Timetable from "../../icons/Timetable";
import ArrowRight from "../../icons/ArrowRight";
import {text} from "../../helpers/text";
import LocationMarker from "../../icons/LocationMarker";

const TooltipWrapper = styled.div``;

const TooltipDataRow = styled.div`
  width: 210px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  font-size: ${(p) => (p.small ? `0.875rem` : "0.95rem")};
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;

  &:nth-child(odd) {
    background: var(--lightest-grey);
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const TlpPropertyValue = styled.span`
  padding-left: 5px;
  color: ${(props) => (props.color ? props.color : "var(--blue)")};
`;

const getTlpDecisionColor = (decision) =>
  decision === "ACK" ? "var(--green)" : decision === "NAK" ? "var(--red)" : "var(--blue)";

const decorate = flow(observer, inject("state"));

const TlpTooltip = decorate(
  ({
    journey = null,
    event = null,
    permanent = false,
    sticky = true,
    direction = "left",
    offset = [-25, 0],
    state,
  }) => {
    const prevEvent = useRef(null);
    let usingEvent = event || prevEvent.current;
    const {user = null} = state;

    if (!usingEvent) {
      return null;
    }

    if (event) {
      prevEvent.current = event;
    }

    return (
      <Tooltip
        className="tooltip-unpadded"
        sticky={sticky}
        permanent={permanent}
        offset={offset}
        direction={direction}>
        <TooltipWrapper data-testid="hfp-tooltip-content">
          <TooltipDataRow>
            <strong>
              {event.type === "TLR" ? (
                <>Liikennevaloetuusilmaisu</>
              ) : (
                <>Liikennevalokojeen vastaus</>
              )}
            </strong>
          </TooltipDataRow>
          <TooltipDataRow data-testid="hfp-event-time">
            <RealTime2 fill="var(--blue)" width="1rem" height="1rem" />
            {moment.tz(usingEvent.recordedAt, TIMEZONE).format("YYYY-MM-DD, HH:mm:ss")}
          </TooltipDataRow>
          {user && (
            <TooltipDataRow>
              <Bus fill="var(--blue)" width="1rem" height="1rem" />
              {journey.uniqueVehicleId}
            </TooltipDataRow>
          )}
          {event.junctionId && (
            <TooltipDataRow>
              Junction id: <TlpPropertyValue>{event.junctionId}</TlpPropertyValue>
            </TooltipDataRow>
          )}
          {event.signalGroupNbr && (
            <TooltipDataRow>
              Signal group number:{" "}
              <TlpPropertyValue>{event.signalGroupNbr}</TlpPropertyValue>
            </TooltipDataRow>
          )}
          {event.requestId && (
            <TooltipDataRow>
              Request id: <TlpPropertyValue>{event.requestId}</TlpPropertyValue>
            </TooltipDataRow>
          )}
          {event.decision && (
            <TooltipDataRow>
              Decision:{" "}
              <TlpPropertyValue color={getTlpDecisionColor(event.decision)}>
                {event.decision}
              </TlpPropertyValue>
            </TooltipDataRow>
          )}
          {event.attemptSeq && (
            <TooltipDataRow>
              Attempt: <TlpPropertyValue>{event.attemptSeq}</TlpPropertyValue>
            </TooltipDataRow>
          )}
          {event.requestType && (
            <TooltipDataRow>
              Request type:{" "}
              <TlpPropertyValue>{event.requestType.toLowerCase()}</TlpPropertyValue>
            </TooltipDataRow>
          )}
          {event.priorityLevel && (
            <TooltipDataRow>
              Priority:{" "}
              <TlpPropertyValue>{event.priorityLevel.toLowerCase()}</TlpPropertyValue>
            </TooltipDataRow>
          )}
          {event.reason && (
            <TooltipDataRow>
              Reason: <TlpPropertyValue>{event.reason.toLowerCase()}</TlpPropertyValue>
            </TooltipDataRow>
          )}
          {!!usingEvent.delay && (
            <TooltipDataRow>
              <Time2 fill="var(--blue)" width="1rem" height="1rem" /> {usingEvent.delay}{" "}
              sek.
            </TooltipDataRow>
          )}
          <TooltipDataRow>
            <LocationMarker fill="var(--blue)" width="1rem" height="1rem" />{" "}
            {get(usingEvent, "loc", text("general.unknown"))}
          </TooltipDataRow>
        </TooltipWrapper>
      </Tooltip>
    );
  }
);

export default TlpTooltip;
