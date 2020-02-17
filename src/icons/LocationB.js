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
          d="M6.512,15.614 L6.512,5.786 C6.512,5.012 7.124,4.4 7.898,4.4 L12.362,4.4 C13.802,4.4 14.936,4.796 15.656,5.516 C16.232,6.092 16.52,6.794 16.52,7.658 L16.52,7.694 C16.52,9.116 15.764,9.908 14.864,10.412 C16.322,10.97 17.222,11.816 17.222,13.508 L17.222,13.544 C17.222,15.848 15.35,17 12.506,17 L7.898,17 C7.124,17 6.512,16.388 6.512,15.614 Z M9.212,9.494 L11.768,9.494 C12.992,9.494 13.766,9.098 13.766,8.162 L13.766,8.126 C13.766,7.298 13.118,6.83 11.948,6.83 L9.212,6.83 L9.212,9.494 Z M9.212,14.57 L12.506,14.57 C13.73,14.57 14.468,14.138 14.468,13.202 L14.468,13.166 C14.468,12.32 13.838,11.798 12.416,11.798 L9.212,11.798 L9.212,14.57 Z"
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
    outer: Colors.secondary.hslGreen,
  },
};

Icon.displayName = "Icons.LocationB";
