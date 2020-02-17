import React from "react";
import {Svg, Circle, G, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize, svgTranslate} from "../helpers/svg";
import {Colors} from "./HSL_COLORS";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 24 14"
      preserveAspectRatio="xMidYMid meet">
      <G id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <G id="icon-terminus">
          <Path
            d="M3,4 L12,4 L12,10 L3,10 C1.34314575,10 2.02906125e-16,8.65685425 0,7 C-2.02906125e-16,5.34314575 1.34314575,4 3,4 Z"
            id="Rectangle-7"
            fill={fill}
          />
          <G id="Oval-4" {...svgTranslate(10.0, 0.0)}>
            <G id="path-1-link" fill={fill}>
              <Circle
                id="Oval"
                stroke={fill}
                fill="transparent"
                strokeWidth="3"
                cx="7"
                cy="7"
                r="5.5"
              />
            </G>
          </G>
        </G>
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
  fill: Colors.transport.bus,
};

Icon.displayName = "Icons.Terminus";
