import React from "react";
import {Svg, G, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 16 16"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <G fill={fill}>
        <Path d="M15,9.9987 C14.447,9.9987 14,10.4457 14,10.9987 L14,13.9987 L2,13.9987 L2,10.9987 C2,10.4457 1.553,9.9987 1,9.9987 C0.447,9.9987 0,10.4457 0,10.9987 L0,13.9987 C0,15.1017 0.897,15.9987 2,15.9987 L14,15.9987 C15.103,15.9987 16,15.1017 16,13.9987 L16,10.9987 C16,10.4457 15.553,9.9987 15,9.9987" />
        <Path d="M5,4.9987 C5.256,4.9987 5.512,4.9007 5.707,4.7057 L7,3.4127 L7,10.9987 C7,11.5517 7.447,11.9987 8,11.9987 C8.553,11.9987 9,11.5517 9,10.9987 L9,3.4127 L10.293,4.7057 C10.488,4.9007 10.744,4.9987 11,4.9987 C11.256,4.9987 11.512,4.9007 11.707,4.7057 C12.098,4.3147 12.098,3.6827 11.707,3.2917 L8.708,0.2927 C8.616,0.1997 8.505,0.1267 8.382,0.0757 C8.138,-0.0253 7.862,-0.0253 7.618,0.0757 C7.495,0.1267 7.384,0.1997 7.292,0.2927 L4.293,3.2917 C3.902,3.6827 3.902,4.3147 4.293,4.7057 C4.488,4.9007 4.744,4.9987 5,4.9987" />
      </G>
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.Share";
