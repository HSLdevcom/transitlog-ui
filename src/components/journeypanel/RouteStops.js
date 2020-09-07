import React, {useCallback} from "react";
import styled from "styled-components";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import RouteStop from "./RouteStop";
import {inject} from "../../helpers/inject";
import {SidePanelTabs} from "../../constants";
import {useQueryData} from "../../hooks/useQueryData";
import {routeStopsQuery} from "../../queries/StopsByRouteQuery";
import get from "lodash/get";

const StopsListWrapper = styled.div`
  padding: 0.5rem 0;
`;

const StopsList = styled.div`
  padding: 1rem 0.5rem 0 0;
  width: 100%;
  color: var(--light-grey);
`;

const decorate = flow(observer, inject("Filters", "UI"));

const RouteStops = decorate(({state: {date, route}, color, Filters, UI}) => {
  let {data: routeStopsData} = useQueryData(routeStopsQuery, {
    skip: !route,
    variables: {
      routeId: get(route, "routeId"),
      direction: get(route, "direction"),
      date,
    },
  });

  let routeStops = routeStopsData || [];

  const onClick = useCallback(
    (stopId) => {
      if (stopId) {
        Filters.setStop(stopId);
        UI.setSidePanelTab(SidePanelTabs.Timetables);
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
            key={stop.id}
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
