import React from "react";
import {Svg, G, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {Colors} from "./HSL_COLORS";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg {...rest} {...svgSize(height, width)} viewBox="0 0 20 20">
      <G
        id="picto"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        transform="matrix(0.07055571,0,0,0.07055571,-9.5367443e-7,-0.00592807)">
        <G>
          <G>
            <Path
              d="M 141.726,0.084 C 63.461,0.084 0,63.538 0,141.81 c 0,78.27 63.461,141.738 141.726,141.738 78.289,0 141.738,-63.469 141.738,-141.738 C 283.465,63.538 220.015,0.084 141.726,0.084 Z m -0.01,244.806 c -56.91,0 -103.058,-46.138 -103.058,-103.064 0,-56.914 46.148,-103.052 103.058,-103.052 56.932,0 103.058,46.138 103.058,103.052 0.001,56.926 -46.126,103.064 -103.058,103.064 z"
              id="path8"
              fill={fill.inner ? fill.inner : fill}
            />
            <Path
              d="m 175.66,102.489 c -7.114,7.015 -14.204,14.053 -21.308,21.067 0,-16.218 0,-32.446 0,-48.638 0,-16.28 -25.226,-16.28 -25.226,0 0,26.044 0,52.113 0,78.143 -0.013,0.625 0.024,1.235 0.115,1.847 0.432,5.47 3.83,8.935 8.056,10.321 3.985,1.77 8.733,1.542 12.82,-2.138 0.138,-0.115 0.264,-0.215 0.406,-0.344 0.039,-0.024 0.089,-0.05 0.115,-0.088 14.28,-14.118 28.573,-28.221 42.84,-42.35 11.61,-11.429 -6.235,-29.263 -17.818,-17.82 z"
              id="path10"
              fill={fill.inner ? fill.inner : fill}
            />
          </G>
        </G>
      </G>
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      inner: PropTypes.string,
      outer: PropTypes.string,
    }),
  ]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.defaultProps = {
  fill: {
    inner: Colors.primary.hslGrey,
    outer: Colors.primary.hslBlue,
  },
};

Icon.displayName = "Icons.AddCard";
