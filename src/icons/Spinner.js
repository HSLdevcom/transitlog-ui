import React from "react";
import PropTypes from "prop-types";
import {Svg, Path} from "react-primitives-svg";
import {svgSize} from "../helpers/svg";
import {Colors} from "./HSL_COLORS";

const Spinner = ({width, height, fill, ...rest}) => (
  <Svg {...svgSize(height, width)} viewBox="0 0 80 80" {...rest} version="1.1">
    <Path
      fill={fill}
      d="M40,80C17.944,80,0,62.056,0,40C0,17.944,17.944,0,40,0c22.056,0,40,17.944,40,40c0,2.209-1.791,4-4,4s-4-1.791-4-4C72,22.355,57.645,8,40,8C22.355,8,8,22.355,8,40c0,17.645,14.355,32,32,32c2.209,0,4,1.791,4,4S42.209,80,40,80z"
    />
  </Svg>
);

Spinner.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  fill: PropTypes.string.isRequired,
};

Spinner.defaultProps = {
  fill: Colors.secondary.hslGreenLight,
};

Spinner.displayName = "Spinner";

export default Spinner;
