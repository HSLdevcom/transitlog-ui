import React from "react";

import {Svg, Path} from "react-primitives-svg";
import PropTypes from "prop-types";

import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 28 25"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <Path
        fill={fill}
        d="M26.76 20.023c.328.474.469 1.042.469 1.61 0 1.61-1.316 2.983-2.96 2.983H2.938A2.902 2.902 0 0 1 .4 23.101a2.972 2.972 0 0 1 0-2.936L11.067 1.507A2.955 2.955 0 0 1 13.604.039c1.08 0 2.02.568 2.584 1.468l10.571 18.516zM15.246 6.573c.047-.567-.33-.993-.845-.993h-1.598c-.517 0-.845.426-.798.994l.798 9.282c.047.473.376.805.799.805.47 0 .799-.332.845-.805l.799-9.282zM15.2 19.882c0-.9-.658-1.563-1.598-1.563-.892 0-1.597.664-1.597 1.563v.237c0 .9.705 1.562 1.597 1.562.94 0 1.598-.663 1.598-1.562v-.237z"
      />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
Icon.displayName = "Icons.Notices";
