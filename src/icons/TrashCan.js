import React from "react";
import {Svg, G, Rect, Path} from "react-primitives-svg";
import PropTypes from "prop-types";

import {svgSize} from "../helpers/svg";
import {Colors} from "./HSL_COLORS";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 20 22"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <Rect fill={fill} x="0" y="3" width="20" height="2" rx="1" />
        <Path
          d="M2,5 L18,5 L18,19 C18,20.6568542 16.6568542,22 15,22 L5,22 C3.34314575,22 2,20.6568542 2,19 L2,5 Z"
          fill={fill}
        />
        <Rect fill="#FFFFFF" x="7" y="8" width="2" height="10" rx="1" />
        <Rect fill="#FFFFFF" x="11" y="8" width="2" height="10" rx="1" />
        <Path
          d="M6,0 L14,0 L14,1 C14,1.55228475 13.5522847,2 13,2 L7,2 C6.44771525,2 6,1.55228475 6,1 L6,0 Z"
          fill={fill}
        />
        <Rect fill={fill} x="6" y="1" width="2" height="3" />
        <Rect fill={fill} x="12" y="1" width="2" height="3" />
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
  fill: Colors.primary.hslGrey,
};

Icon.displayName = "Icons.TrashCan";
