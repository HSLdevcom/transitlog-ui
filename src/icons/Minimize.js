import React from "react";
import {Svg, Path} from "react-primitives-svg";

import PropTypes from "prop-types";

import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 37 36"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <Path
        fill={fill}
        fillRule="nonzero"
        d="M25.707 23.111h7.52c.852 0 1.543-.69 1.543-1.543v-.001c0-.852-.691-1.543-1.543-1.543H22.108a1.75 1.75 0 0 0-1.75 1.75v11.118a1.544 1.544 0 0 0 3.088 0v-7.52l10.02 10.02c.603.603 1.581.603 2.184 0l.077-.077a1.544 1.544 0 0 0 0-2.183l-10.021-10.02zm-11.43-21.7c-.852 0-1.544.69-1.544 1.543v7.52L2.713.452a1.544 1.544 0 0 0-2.183 0L.452.53a1.544 1.544 0 0 0 0 2.183l10.022 10.022h-7.52c-.853 0-1.544.69-1.544 1.543v.001c0 .852.691 1.543 1.544 1.543h11.118a1.75 1.75 0 0 0 1.75-1.75V2.954c0-.853-.69-1.544-1.543-1.544h-.001z"
      />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.Minimize";
