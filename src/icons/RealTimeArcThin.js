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
        d="M2,24 C0.896,24 0,23.104 0,22 C0,9.869 9.869,0 22,0 C23.104,0 24,0.896 24,2 C24,3.104 23.104,4 22,4 C12.075,4 4,12.075 4,22 C4,23.104 3.104,24 2,24"
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

Icon.displayName = "Icons.RealTimeArcThin";
