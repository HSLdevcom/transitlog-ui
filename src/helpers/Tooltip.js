import React, {useEffect, useCallback, useState} from "react";
import {useTransition, animated} from "react-spring";
import styled from "styled-components";
import {useMousePosition} from "../hooks/useMousePosition";

export const TooltipContext = React.createContext();

const Tooltip = styled(animated.div).attrs(({position = {x: 0, y: 0}}) => ({
  style: {
    transform: `translate(${position.x + 15}px, ${position.y + 15}px)`,
  },
}))`
  position: fixed;
  top: 0;
  left: 0;
  max-width: 30rem;
  max-height: 10rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  background: white;
  border-radius: 0 7px 7px 7px;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.2);
  transform: translate(0, 0);
  z-index: 100;
  overflow: hidden;
`;

function createTooltipId(rect, text) {
  return Object.values(rect).join(",") + text;
}

const tooltips = new Map();

export const registerTooltip = (rect = {}, text = "[Text not set]") => {
  const tooltipId = createTooltipId(rect, text);

  const tooltipConfig = {
    ...rect,
    text,
  };

  tooltips.set(tooltipId, tooltipConfig);

  return () => tooltips.remove(tooltipId);
};

export const TooltipContainer = ({children}) => {
  const [tooltipText, setTooltip] = useState("");
  const mousePosition = useMousePosition();

  const transitions = useTransition(!!tooltipText, null, {
    enter: {opacity: 1},
    leave: {opacity: 0},
  });

  useEffect(() => {
    const {x, y} = mousePosition;
    let didFindTooltip = false;

    for (const {left, right, top, bottom, text} of tooltips.values()) {
      if (x >= left && x <= right && y >= top && y <= bottom) {
        setTooltip(text);
        didFindTooltip = true;
      }
    }

    if (!didFindTooltip) {
      setTooltip("");
    }
  }, [mousePosition.x, mousePosition.y]);

  return (
    <>
      {children}
      {transitions.map(
        ({item, key, props}) =>
          item && (
            <Tooltip position={mousePosition} key={key} style={props}>
              {tooltipText}
            </Tooltip>
          )
      )}
    </>
  );
};
