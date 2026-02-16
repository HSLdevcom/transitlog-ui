import React from "react";
import {Svg} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 16 16"
      preserveAspectRatio="xMidYMid meet"
      fill={"#464646"}>
      <rect width="16" height="16" id="icon-bound" fill="none" />
      <rect x="3.5" y="3.5" width="8" height="8" />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.Square";
