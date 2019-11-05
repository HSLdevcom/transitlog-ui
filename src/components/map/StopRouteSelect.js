import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import get from "lodash/get";
import flow from "lodash/flow";
import styled from "styled-components";
import {withStop} from "../../hoc/withStop";
import {inject} from "../../helpers/inject";
import TimingStop from "../../icons/TimingStop";
import {getModeColor} from "../../helpers/vehicleColor";

const StopOptionButton = styled.button`
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  background: var(--lightest-grey);
  margin: 0 0 0.5rem 0;
  border: ${({color = "var(--lightest-grey)"}) =>
    color ? `3px solid ${color}` : "3px solid var(--lightest-grey)"};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--lighter-grey);
  }

  svg {
    margin-left: 0.75rem;
  }
`;

function cleanRouteId(routeId) {
  return routeId.substring(1).replace(/^0+/, "");
}

const decorate = flow(
  observer,
  withStop,
  inject("Filters")
);

export const StopRouteSelect = decorate(({stop, stopLoading, color, Filters}) => {
  const onSelectRoute = useCallback(
    (route) => () => route && Filters.setRoute(route),
    []
  );

  return stopLoading
    ? "loading"
    : get(stop, "routes", []).map((route) => {
        const buttonColor = getModeColor(route.mode) || color;

        return (
          <StopOptionButton
            color={buttonColor}
            key={`route_${route.routeId}_${route.direction}`}
            onClick={onSelectRoute(route)}>
            {cleanRouteId(route.routeId)}
            {route.isTimingStop && <TimingStop fill={color} width="1rem" height="1rem" />}
          </StopOptionButton>
        );
      });
});

export default StopRouteSelect;
