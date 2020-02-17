import React from "react";
import {Svg, G, Rect, Circle} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";
import {Colors} from "./HSL_COLORS";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 24 18"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <G>
        <Rect id="Rectangle-5" fill={fill} x="0" y="2" width="5" height="2" rx="1" />
        <Rect
          id="Rectangle-5-Copy-3"
          fill={fill}
          x="9"
          y="2"
          width="15"
          height="2"
          rx="1"
        />
        <Rect
          id="Rectangle-5-Copy-2"
          fill={fill}
          x="0"
          y="14"
          width="5"
          height="2"
          rx="1"
        />
        <Rect
          id="Rectangle-5-Copy-5"
          fill={fill}
          x="0"
          y="8"
          width="15"
          height="2"
          rx="1"
        />
        <Rect
          id="Rectangle-5-Copy-4"
          fill={fill}
          x="9"
          y="14"
          width="15"
          height="2"
          rx="1"
        />
        <Rect
          id="Rectangle-5-Copy-6"
          fill={fill}
          x="19"
          y="8"
          width="5"
          height="2"
          rx="1"
        />
        <Circle
          id="Oval-2"
          fill={Colors.background.hslWhite}
          stroke={fill}
          strokeWidth="1.5"
          cx="7"
          cy="3"
          r="2.25"
        />
        <Circle
          id="Oval-2-Copy-2"
          fill={Colors.background.hslWhite}
          stroke={fill}
          strokeWidth="1.5"
          cx="7"
          cy="15"
          r="2.25"
        />
        <Circle
          id="Oval-2-Copy-3"
          fill={Colors.background.hslWhite}
          stroke={fill}
          strokeWidth="1.5"
          cx="17"
          cy="9"
          r="2.25"
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

Icon.defaultProps = {
  fill: Colors.primary.hslGreyDark,
};

Icon.displayName = "Icons.Settings";
