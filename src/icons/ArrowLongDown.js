import React from "react";
import {Svg, Path} from "react-primitives-svg";

import PropTypes from "prop-types";

import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 35 35"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <Path
        fill={fill}
        fillRule="nonzero"
        d="M34.352 16.02c.838.838.838 2.165 0 3.073-.908.838-2.236.838-3.073 0L19.61 7.426v25.43a2.176 2.176 0 0 1-2.166 2.166 2.176 2.176 0 0 1-2.165-2.166V7.426L3.682 19.093a2.193 2.193 0 0 1-3.073 0c-.838-.908-.838-2.235 0-3.073L15.909.65c.14-.07.699-.629 1.536-.629.838 0 1.397.559 1.537.629l15.37 15.37z"
      />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.ArrowLongDown";
