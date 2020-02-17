import {Circle} from "react-leaflet";
import React from "react";

export const StopRadius = ({center, radius, children, color, isHighlighted = false}) => {
  return (
    <Circle
      className="test-class-stop-radius"
      interactive={false}
      pane={isHighlighted ? "selected-stop-radius" : "stop-radius"}
      center={center}
      weight={isHighlighted ? 2 : 1}
      opacity={isHighlighted ? 0.875 : 0.2}
      color={color}
      fillColor={color}
      fillOpacity={isHighlighted ? 0.3 : 0.15}
      radius={radius}>
      {children}
    </Circle>
  );
};
