import React from "react";
import {Svg, G, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";
import {Colors} from "./HSL_COLORS";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 24 32"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <G>
        <Path
          d="M11.525,0 C17.89,0 23.05,5.057 23.05,11.294 C23.05,17.531 11.525,32 11.525,32 C11.525,32 0,17.531 0,11.294 C0,5.056 5.16,0 11.525,0 Z"
          id="Shape"
          fill={fill.outer}
          fillRule="nonzero"
        />
        <Path
          d="M5.648,15.812 C5.648,15.614 5.72,15.416 5.81,15.218 L10.202,5.3 C10.508,4.616 11.066,4.202 11.822,4.202 L11.984,4.202 C12.74,4.202 13.28,4.616 13.586,5.3 L17.978,15.218 C18.068,15.416 18.122,15.596 18.122,15.776 C18.122,16.514 17.546,17.108 16.808,17.108 C16.16,17.108 15.728,16.73 15.476,16.154 L14.63,14.174 L9.086,14.174 L8.204,16.244 C7.97,16.784 7.502,17.108 6.926,17.108 C6.206,17.108 5.648,16.532 5.648,15.812 Z M10.112,11.726 L13.604,11.726 L11.858,7.568 L10.112,11.726 Z"
          id="A"
          fill={fill.inner}
          fillRule="evenodd"
        />
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
    outer: Colors.secondary.hslPinkDark,
  },
};

Icon.displayName = "Icons.LocationA";
