import React, {useRef} from "react";
import {Tooltip} from "react-leaflet";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import {text} from "../../helpers/text";

const TooltipWrapper = styled.div`
  min-width: max-content;
`;

const ApcDataRow = styled.div`
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

const ApcPropertyValue = styled.span`
  padding-left: 5px;
  color: ${(props) => (props.color ? props.color : "var(--blue)")};
`;

const decorate = flow(observer, inject("state"));

const ApcTooltip = decorate(
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
          <ApcDataRow>
            <strong>{text(`journey.event.${event.type}`)}</strong>
          </ApcDataRow>
          <ApcDataRow>
            {text("apc.totalPassengersIn")}:{" "}
            <ApcPropertyValue>{event.totalPassengersIn}</ApcPropertyValue>
          </ApcDataRow>
          <ApcDataRow>
            {text("apc.totalPassengersOut")}:{" "}
            <ApcPropertyValue>{event.totalPassengersOut}</ApcPropertyValue>
          </ApcDataRow>
          <ApcDataRow>
            {text("apc.vehicleLoad")}:{" "}
            <ApcPropertyValue>{event.vehicleLoad}</ApcPropertyValue>
          </ApcDataRow>
          <ApcDataRow>
            {text("apc.vehicleLoadRatio")}:{" "}
            <ApcPropertyValue>{event.vehicleLoadRatio}</ApcPropertyValue>
          </ApcDataRow>
        </TooltipWrapper>
      </Tooltip>
    );
  }
);

export default ApcTooltip;
