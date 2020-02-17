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
        d="M18.982 34.394c-.14.07-.699.63-1.537.63-.837 0-1.396-.56-1.536-.63l-15.3-15.37c-.838-.839-.838-2.165 0-3.074a2.193 2.193 0 0 1 3.073 0L15.28 27.617V2.187c0-1.188.978-2.166 2.165-2.166 1.188 0 2.166.978 2.166 2.166v25.43L31.28 15.95c.837-.838 2.165-.838 3.073 0 .838.908.838 2.235 0 3.074l-15.37 15.37z"
      />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.ArrowDownLong";
