import React, {useCallback, useMemo, useEffect} from "react";
import {observer} from "mobx-react-lite";
import get from "lodash/get";
import flow from "lodash/flow";
import groupBy from "lodash/groupBy";
import styled, {css} from "styled-components";
import {inject} from "../../helpers/inject";
import TimingStop from "../../icons/TimingStop";
import {getModeColor} from "../../helpers/vehicleColor";
import {text} from "../../helpers/text";
import {Button} from "../Forms";
import {withLeaflet} from "react-leaflet";
import {useQueryData} from "../../hooks/useQueryData";
import {singleStopQuery} from "./StopLayer";

const StopOptionButton = styled(Button).attrs(() => ({small: true}))`
  text-decoration: none;
  color: white;
  border: 0;
  margin: 0 0.5rem 0.5rem 0;
  background: ${({color = "var(--lightest-grey)"}) =>
    color ? color : "var(--lightest-grey)"};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  font-family: var(--font-family);
  font-size: 0.875rem;
  padding: 0.35rem 1rem 0.35rem 0.5rem;
  height: auto;
  width: 100%;

  ${(p) =>
    p.selected
      ? css`
          border: 2px solid white;
          box-shadow: 0 0 0 2px
            ${({color = "var(--lightest-grey)"}) =>
              color ? color : "var(--lightest-grey)"};
        `
      : ""}

  &:hover {
    background: ${({color = "var(--lightest-grey)"}) =>
      color ? color : "var(--lightest-grey)"};
    border: 0;
  }
`;

const RouteData = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  margin-left: 0.5rem;
`;

const RouteName = styled.span`
  font-size: 0.75rem;
`;

const RouteGroupHeading = styled.h5`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--lighter-grey);
`;

const RouteGroupContainer = styled.div``;

const decorate = flow(observer, withLeaflet, inject("Filters"));

export const StopRouteSelect = decorate(
  ({stopId, stopLoading, color, Filters, state, leaflet}) => {
    const {data: stop} = useQueryData(
      singleStopQuery,
      {
        skip: !stopId,
        variables: {
          stopId,
          date: state.date,
        },
      },
      "single stop query"
    );

    const onSelectRoute = useCallback(
      (route) => () => route && Filters.setRoute(route),
      []
    );

    const selectedRoute = get(state, "route", null);

    const routeGroups = useMemo(() => {
      const routes = get(stop, "routes", []);
      return Object.entries(groupBy(routes, (route) => route.routeId.slice(0, 4)));
    }, [stop]);

    useEffect(() => {
      if (stopLoading) {
        return;
      }

      setTimeout(() => {
        const popup = leaflet.popupContainer._popup;

        if (!popup) {
          return;
        }

        const px = leaflet.map.project(popup._latlng); // find the pixel location on the map where the popup anchor is
        px.y -= popup._container.clientHeight / 2; // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
        leaflet.map.panTo(leaflet.map.unproject(px), {animate: true}); // pan to new center
      }, 100);
    }, [stopLoading]);

    return stopLoading
      ? text("general.loading")
      : routeGroups.map(([routeGroupName, routes]) => (
          <React.Fragment key={`route_group_${routeGroupName}`}>
            <RouteGroupHeading>{routeGroupName}</RouteGroupHeading>
            <RouteGroupContainer>
              {routes.map((route) => {
                const buttonColor = getModeColor(route.mode) || color;

                return (
                  <StopOptionButton
                    selected={
                      selectedRoute &&
                      selectedRoute.routeId === route.routeId &&
                      selectedRoute.direction === route.direction
                    }
                    isTimingStop={route.isTimingStop}
                    color={buttonColor}
                    key={`route_${route.routeId}_${route.direction}`}
                    onClick={onSelectRoute(route)}>
                    {route.isTimingStop && (
                      <TimingStop fill="white" width="1rem" height="1rem" />
                    )}
                    <RouteData>
                      <span>
                        {route.routeId} / {route.direction}
                      </span>
                      <RouteName>
                        {route.origin} - {route.destination}
                      </RouteName>
                    </RouteData>
                  </StopOptionButton>
                );
              })}
            </RouteGroupContainer>
          </React.Fragment>
        ));
  }
);

export default StopRouteSelect;
