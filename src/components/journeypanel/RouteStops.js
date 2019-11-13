import React, {useCallback} from "react";
import styled from "styled-components";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import RouteStop from "./RouteStop";
import {inject} from "../../helpers/inject";

const StopsListWrapper = styled.div`
  padding: 0.5rem 0;
`;

const StopsList = styled.div`
  padding: 1rem 0.5rem 0 0;
  width: 100%;
  color: var(--light-grey);
`;

const decorate = flow(
  observer,
  inject("Filters", "UI")
);

const RouteStops = decorate(({routeStops, color, Filters, UI}) => {
  const onClick = useCallback(
    (stopId) => {
      if (stopId) {
        Filters.setStop(stopId);
      }
    },
    [Filters]
  );

  const onHover = useCallback(
    (stopId) => {
      UI.highlightStop(stopId);
    },
    [UI]
  );

  if (routeStops.length === 0) {
    return null;
  }

  return (
    <StopsListWrapper>
      <StopsList>
        {routeStops.map((stop, index) => (
          <RouteStop
            key={stop.stopId}
            color={color}
            stop={stop}
            onHover={onHover}
            onClick={onClick}
            isFirst={index === 0}
            isLast={index === routeStops.length - 1}
          />
        ))}
      </StopsList>
    </StopsListWrapper>
  );
});

export default RouteStops;
