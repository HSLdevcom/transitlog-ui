import React from "react";
import {Svg, Path, G} from "react-primitives-svg";
import PropTypes from "prop-types";

import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 38 37"
      preserveAspectRatio="xMidYMid meet">
      <G>
        <Path
          fill={fill}
          d="M29.9603862,12.9716601 L29.9603862,11.9216896 C29.9603862,11.8598035 30.0860661,11.7980918 30.2115688,11.7980918 L30.2115688,37 L38,37 L38,0 L26.505873,0 L19.2825582,25.2637942 L19.1570556,26.9932908 L18.9686243,26.9932908 L18.7801931,25.2637942 L11.5570556,0 L0,0 L0,37 L7.91411112,37 L7.91411112,11.7980918 C7.97686243,11.7980918 8.10236507,11.8598035 8.10236507,11.9216896 L8.10236507,12.9716601 L15.1372487,37 L22.8629286,37 L29.9603862,12.9716601 Z"
          id="Shape"
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

Icon.displayName = "Icons.Subway";
