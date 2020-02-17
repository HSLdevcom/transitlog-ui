import React from "react";
import {Svg, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 32 20"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <Path
        fill={fill}
        fillRule="nonzero"
        d="M16 6.36l12.491 12.49a2.055 2.055 0 1 0 2.907-2.906L16 .546h-.001l-2.906 2.907L.602 15.943a2.055 2.055 0 1 0 2.907 2.908L16 6.36z"
      />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.ArrowUp";
