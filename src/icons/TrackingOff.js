import React from "react";
import {Svg, Circle, G} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";
import {Colors} from "./HSL_COLORS";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 38 38"
      preserveAspectRatio="xMidYMid meet">
      <G id="Mobile">
        <Circle id="Oval" fill={fill.outer} cx="19" cy="19" r="19" />
        <Circle
          id="Oval"
          stroke={fill.inner}
          fill={fill.outer}
          strokeWidth="1.8"
          cx="19"
          cy="19"
          r="15.5"
        />
        <Circle
          id="Oval"
          stroke={fill.inner}
          fill={fill.outer}
          strokeWidth="1.5"
          cx="19"
          cy="19"
          r="11.5"
        />
        <Circle id="Oval" fill={fill.inner} cx="19" cy="19" r="5.5" />
      </G>
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.shape({
    inner: PropTypes.string,
    outer: PropTypes.string,
  }),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.defaultProps = {
  fill: {
    inner: Colors.primary.hslWhite,
    outer: Colors.primary.hslGrey,
  },
};

Icon.displayName = "Icons.TrackingOff";
