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
        d="M.648 19.023c-.07-.14-.629-.699-.629-1.537 0-.837.559-1.396.629-1.536L16.017.65c.839-.837 2.165-.837 3.074 0a2.195 2.195 0 0 1 0 3.075L7.425 15.322h25.428c1.188 0 2.166.978 2.166 2.166a2.176 2.176 0 0 1-2.166 2.165H7.425L19.09 31.32c.838.838.838 2.165 0 3.073-.908.838-2.235.838-3.074 0L.647 19.024z"
      />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.ArrowLeftLong";
