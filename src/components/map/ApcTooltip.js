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

    let vehicledLoadRatio = text(`apc.${event.vehicleLoadRatioText}`);
    if (event.vehicleLoadRatio === 0 || event.vehicleLoadRatio > 0) {
      vehicledLoadRatio = `${(100 * event.vehicleLoadRatio).toFixed()}%`;
    }
    let vehicleLoadRatioColor =
      event.vehicleLoadRatio > 0 ? "var(--blue)" : "var(--grey)";

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
          {(event.totalPassengersIn || event.totalPassengersIn == 0) && (
            <ApcDataRow>
              {text("apc.totalPassengersIn")}:{" "}
              <ApcPropertyValue>{event.totalPassengersIn}</ApcPropertyValue>
            </ApcDataRow>
          )}
          {(event.totalPassengersOut || event.totalPassengersOut == 0) && (
            <ApcDataRow>
              {text("apc.totalPassengersOut")}:{" "}
              <ApcPropertyValue>{event.totalPassengersOut}</ApcPropertyValue>
            </ApcDataRow>
          )}
          {(event.vehicleLoad || event.vehicleLoad == 0) && (
            <ApcDataRow>
              {text("apc.vehicleLoad")}:{" "}
              <ApcPropertyValue>{event.vehicleLoad}</ApcPropertyValue>
            </ApcDataRow>
          )}
          {vehicledLoadRatio && (
            <ApcDataRow>
              {text("apc.vehicleLoadRatio")}:{" "}
              <ApcPropertyValue color={vehicleLoadRatioColor}>
                {vehicledLoadRatio}
              </ApcPropertyValue>
            </ApcDataRow>
          )}
        </TooltipWrapper>
      </Tooltip>
    );
  }
);

export default ApcTooltip;
