import React from "react";
import {Svg, Path, Circle, G} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgTranslate, svgSize} from "../helpers/svg";
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
        <Path
          {...svgTranslate(0.5, -0.5)}
          fill={fill.inner}
          d="M23.5788538,26.0741036 C23.0354072,26.0741036 22.5692711,25.7273437 22.4930976,25.2259631 L21.8643443,23.5794398 L21.5539658,23.5794398 L21.5539658,26.1215873 L15.7704665,26.1215873 L15.7704665,23.5794398 L15.460088,23.5794398 L14.9235009,25.1873079 C14.8075353,25.6886885 14.3413991,26.0354484 13.8366077,26.0354484 C13.1760587,26.0354484 12.6724042,25.4954126 12.6724042,24.9565137 C12.6724042,24.8018929 12.6724042,24.648409 12.7497146,24.4949252 L14.0628164,20.6518772 C14.4505053,19.5729425 15.032607,19.1875275 16.0035346,19.1875275 L21.2435873,19.1875275 C22.213378,19.1875275 22.8341349,19.5729425 23.1843055,20.6518772 L24.6657469,24.5324435 C24.7044021,24.6870642 24.7044021,24.8405481 24.7044021,24.9951689 C24.7044021,25.5340678 24.2382659,26.0741036 23.5788538,26.0741036 Z M18.6809753,18.2245583 L18.643457,18.2245583 C17.0517725,18.2245583 15.7318113,16.9148294 15.7318113,15.2969958 C15.7318113,13.6791622 17.0517725,12.3694332 18.6809753,12.3694332 C20.2726598,12.3694332 21.592621,13.6791622 21.592621,15.2969958 C21.592621,16.9148294 20.2726598,18.2245583 18.6809753,18.2245583 Z"
          id="path-1"
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

Icon.displayName = "Icons.Nearby";
