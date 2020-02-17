import React from "react";
import {Svg, G, Rect, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {Colors} from "./HSL_COLORS";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, stroke, height, width, ...rest}) {
  return (
    <Svg {...rest} {...svgSize(height, width)} viewBox="0 0 32 16" version="1.1">
      <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <Rect stroke={stroke} strokeWidth="2" x="1" y="1" width="27" height="14" rx="3" />
        <Path
          d="M28,4 L31,4 L31,4 C31.5522847,4 32,4.44771525 32,5 L32,11 L32,11 C32,11.5522847 31.5522847,12 31,12 L28,12 L28,4 Z"
          fill={stroke}
        />
        <Path
          d="M4,3 L7,3 L7,13 L4,13 L4,13 C3.44771525,13 3,12.5522847 3,12 L3,4 L3,4 C3,3.44771525 3.44771525,3 4,3 Z"
          fill={fill}
        />
      </G>
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string.isRequired,
  stroke: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.defaultProps = {
  fill: Colors.secondary.hslMagenta,
  stroke: Colors.primary.hslGrey,
};

Icon.displayName = "Icons.BatteryLow";
