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
        d="M19.022 34.393c-.838.838-2.166.838-3.074 0-.838-.908-.838-2.235 0-3.073l11.667-11.667H2.185A2.176 2.176 0 0 1 .02 17.487c0-1.188.978-2.166 2.166-2.166h25.43L15.947 3.724a2.195 2.195 0 0 1 0-3.074c.908-.838 2.236-.838 3.074 0l15.37 15.3c.07.14.628.698.628 1.536 0 .838-.559 1.397-.629 1.537l-15.37 15.369v.001z"
      />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.ArrowRightLong";
