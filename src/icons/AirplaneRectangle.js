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
      viewBox="0 0 35 35"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <G>
        <Path
          fill={fill && fill.outer ? fill.outer : fill}
          d="M0.00109375,4.33234375 C0.00109375,1.96984375 1.96984375,0.00109375 4.33234375,0.00109375 L30.5801563,0.00109375 C33.0301563,0.00109375 34.9989063,1.96984375 34.9989063,4.33234375 L34.9989063,30.5801562 C34.9989063,33.0301562 33.0301563,34.9989062 30.5801563,34.9989062 L4.33234375,34.9989062 C1.96984375,34.9989062 0.00109375,33.0301562 0.00109375,30.5801562 L0.00109375,4.33234375 Z"
          id="Shape"
        />
        <Path
          fill={fill && fill.inner ? fill.inner : Colors.primary.hslWhite}
          d="M29.4459375,24.3545313 L29.4459375,21.3215625 L19.4446875,14.2023438 L19.4446875,5.7509375 C19.4446875,4.67796875 18.5740625,3.80734375 17.4989062,3.80734375 C16.4259375,3.80734375 15.5553125,4.67796875 15.5553125,5.7509375 L15.5553125,14.0710937 L5.5540625,21.3215625 L5.5540625,24.3545313 L15.7325,20.37 L16.2225,27.2540625 L13.4334375,29.3617188 L13.4334375,31.1926563 L17.5142187,29.925 L21.595,31.1926563 L21.595,29.3617188 L18.7764063,27.251875 L19.2664062,20.3710938 L29.4448437,24.355625 L29.4459375,24.3545313 Z"
          id="Shape"
        />
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

Icon.displayName = "Icons.AirplaneRectangle";
