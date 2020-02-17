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
      viewBox="0 0 50 50"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <G fill={fill.outer}>
        <Path d="M-1.76056338e-05,6.27010563 C-1.76056338e-05,2.90144366 2.8072007,0.0942253521 6.17586268,0.0942253521 L43.605088,0.0942253521 C47.09875,0.0942253521 49.9057923,2.90144366 49.9057923,6.27010563 L49.9057923,43.699507 C49.9057923,47.1928169 47.09875,50.0000352 43.605088,50.0000352 L6.17586268,50.0000352 C2.8072007,50.0000352 -1.76056338e-05,47.1928169 -1.76056338e-05,43.699507 L-1.76056338e-05,6.27010563 Z" />
      </G>
      <Path
        fill={fill.inner}
        d="M35.9603862,18.9716601 L35.9603862,17.9216896 C35.9603862,17.8598035 36.0860661,17.7980918 36.2115688,17.7980918 L36.2115688,43 L44,43 L44,6 L32.505873,6 L25.2825582,31.2637942 L25.1570556,32.9932908 L24.9686243,32.9932908 L24.7801931,31.2637942 L17.5570556,6 L6,6 L6,43 L13.9141111,43 L13.9141111,17.7980918 C13.9768624,17.7980918 14.1023651,17.8598035 14.1023651,17.9216896 L14.1023651,18.9716601 L21.1372487,43 L28.8629286,43 L35.9603862,18.9716601 Z"
      />
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
    outer: Colors.transport.subway,
  },
};

Icon.displayName = "Icons.SubwaySign";
