import React from "react";
import {Svg, G, Rect} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg {...rest} {...svgSize(height, width)} viewBox="0 0 30 4" version="1.1">
      <G strokeWidth="1">
        <Rect fill={fill} x="0" y="0" width="30" height="4" rx="2" />
      </G>
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.defaultProps = {
  height: 4,
  width: 30,
};

Icon.displayName = "Icons.Minus";
