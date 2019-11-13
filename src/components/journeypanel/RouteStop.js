import React, {useCallback} from "react";
import get from "lodash/get";
import styled from "styled-components";
import {
  StopElementsWrapper,
  StopMarker,
  TimingStopMarker,
  StopWrapper as DefaultStopWrapper,
  StopContent,
  StopHeading,
} from "../StopElements";
import {applyTooltip} from "../../hooks/useTooltip";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";

const StopWrapper = styled(DefaultStopWrapper)`
  padding: 0;
`;

const StopHeadingButton = styled(StopHeading)`
  margin-left: 0;
  user-select: text;
`;

const StopInfo = styled.span`
  display: block;
  margin-top: -1px;
  color: var(--dark-grey);
  margin-bottom: 0.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const decorate = flow(
  observer,
  inject("state")
);

const RouteStop = decorate(
  ({stop, onClick = () => {}, onHover = () => {}, isFirst, isLast, color}) => {
    const selectWithStopId = useCallback(() => onClick(stop.stopId), [stop.stopId]);
    const hoverWithStopId = useCallback(() => onHover(stop.stopId), [stop.stopId]);
    const hoverReset = useCallback(() => onHover(""), []);

    const onStopClick = useCallback(() => {
      selectWithStopId();
    });

    const hoverProps = {
      onMouseEnter: hoverWithStopId,
      onMouseLeave: hoverReset,
    };

    const stopId = stop.stopId;
    const stopName = get(stop, "name");
    const stopShortId = get(stop, "shortId", "").replace(/ /g, "");

    return (
      <StopWrapper data-testid="journey-stop-item">
        <StopElementsWrapper
          color={color}
          terminus={isFirst ? "origin" : isLast ? "destination" : undefined}>
          {stop.isTimingStop ? (
            <TimingStopMarker color={color} onClick={onStopClick} {...hoverProps} />
          ) : (
            <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
          )}
        </StopElementsWrapper>
        <StopContent {...hoverProps}>
          <StopHeadingButton onClick={onStopClick} {...applyTooltip("Focus on stop")}>
            <StopInfo>
              {stopId}{" "}
              {stopShortId && <span style={{fontSize: "0.75rem"}}>({stopShortId})</span>}
            </StopInfo>
            <StopInfo>{stopName && <strong>{stopName}</strong>}</StopInfo>
          </StopHeadingButton>
        </StopContent>
      </StopWrapper>
    );
  }
);

export default RouteStop;
