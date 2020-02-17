import React from "react";
import {Svg, Path, G} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgTranslate, svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 25 22"
      preserveAspectRatio="xMidYMid meet">
      <G fill={fill} id="Mobile" fillRule="evenodd">
        <Path
          {...svgTranslate(12, 0)}
          d="M12.15,6.75 L7.35,0.8 C7.35,0.8 7.35,0.8 7.3,0.75 C7.25,0.7 7.2,0.65 7.15,0.6 C6.95,0.45 6.7,0.35 6.4,0.35 C6.1,0.35 5.85,0.45 5.65,0.6 C5.6,0.65 5.55,0.7 5.5,0.75 C5.5,0.75 5.5,0.75 5.45,0.8 L0.65,6.75 C0.25,7.25 0.3,8.05 0.85,8.45 C1.35,8.85 2.15,8.8 2.55,8.25 L5.2,5 L5.2,19.9 C5.2,20.55 5.75,21.1 6.4,21.1 C7.05,21.1 7.6,20.55 7.6,19.9 L7.6,5.05 L10.25,8.3 C10.5,8.6 10.85,8.75 11.2,8.75 C11.45,8.75 11.75,8.65 11.95,8.5 C12.5,8.05 12.6,7.3 12.15,6.75 Z"
          id="path-1"
        />
        <Path
          d="M11.7,13.05 C11.15,12.65 10.4,12.7 10,13.25 L7.35,16.5 L7.35,1.6 C7.35,0.95 6.8,0.4 6.15,0.4 C5.5,0.4 4.95,0.95 4.95,1.6 L4.95,16.5 L2.3,13.25 C1.9,12.75 1.1,12.65 0.6,13.05 C0.1,13.45 0,14.25 0.4,14.75 L5.2,20.7 C5.2,20.7 5.25,20.7 5.25,20.75 C5.3,20.8 5.3,20.85 5.35,20.85 C5.35,20.85 5.4,20.9 5.4,20.9 C5.45,20.95 5.5,20.95 5.55,21 C5.6,21 5.6,21.05 5.65,21.05 C5.7,21.1 5.75,21.1 5.85,21.1 C5.85,21.1 5.9,21.1 5.9,21.1 C6,21.1 6.05,21.15 6.15,21.15 C6.25,21.15 6.35,21.15 6.4,21.1 C6.4,21.1 6.45,21.1 6.45,21.1 C6.5,21.1 6.55,21.05 6.65,21.05 C6.7,21.05 6.7,21 6.75,21 C6.8,20.95 6.85,20.95 6.9,20.9 C6.95,20.9 6.95,20.85 6.95,20.85 C7,20.8 7.05,20.8 7.05,20.75 C7.05,20.75 7.1,20.75 7.1,20.7 L11.9,14.75 C12.3,14.2 12.2,13.45 11.7,13.05 Z"
          id="path-3"
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

Icon.displayName = "Icons.Opposite";
