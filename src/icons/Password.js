import React from "react";
import {Svg, G, Path, Polygon} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 16 20"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <G>
        <Polygon
          fill="transparent"
          id="path-1"
          points="16,10.0000167 16,20 0,20 0,10.0000167 0,3.33333333e-05 16,3.33333333e-05"
        />
        <Path
          fill={fill}
          d="M4,8.6667 L4,5.83336667 C4,3.7197 5.71966667,2.00003333 7.83333333,2.00003333 C9.947,2.00003333 11.6666667,3.7197 11.6666667,5.83336667 L11.6666667,8.6667 L4,8.6667 Z M9,15.6667 C9,16.2190333 8.55233333,16.6667 8,16.6667 C7.44766667,16.6667 7,16.2190333 7,15.6667 L7,13.0000333 C7,12.4477 7.44766667,12.0000333 8,12.0000333 C8.55233333,12.0000333 9,12.4477 9,13.0000333 L9,15.6667 Z M14.6666667,8.6667 L13.6666667,8.6667 L13.6666667,5.83336667 C13.6666667,2.61703333 11.0496667,3.33333333e-05 7.83333333,3.33333333e-05 C4.617,3.33333333e-05 2,2.61703333 2,5.83336667 L2,8.6667 L1.33333333,8.6667 C0.597,8.6667 0,9.2637 0,10.0000333 L0,18.6667 C0,19.4030333 0.597,20.0000333 1.33333333,20.0000333 L14.6666667,20.0000333 C15.403,20.0000333 16,19.4030333 16,18.6667 L16,10.0000333 C16,9.2637 15.403,8.6667 14.6666667,8.6667 L14.6666667,8.6667 Z"
          id="Fill-1"
        />
      </G>
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.Password";
