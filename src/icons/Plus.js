import React from "react";
import {Svg, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 35 35"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <Path
        fill={fill}
        d="M14.875,20.125 L2.625,20.125 C1.1746875,20.125 -1.77635684e-15,18.9492188 -1.77635684e-15,17.5 C-3.1918912e-16,16.0496875 1.17578125,14.875 2.625,14.875 L14.875,14.875 L14.875,2.625 C14.875,1.1746875 16.0507812,1.77635684e-15 17.5,1.77635684e-15 C18.9492187,1.77635684e-15 20.125,1.17578125 20.125,2.625 L20.125,14.875 L32.375,14.875 C33.8242188,14.875 35,16.0507813 35,17.5 C35,18.9492188 33.8242188,20.125 32.375,20.125 L20.125,20.125 L20.125,32.375 C20.125,33.8253125 18.9492187,35 17.5,35 C16.0496875,35 14.875,33.8242188 14.875,32.375 L14.875,20.125 Z"
        id="Shape"
      />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.Plus";
