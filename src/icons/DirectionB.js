import React from "react";
import {Svg, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 32 16"
      preserveAspectRatio="xMidYMid meet">
      <Path
        fill={fill}
        fillRule="nonzero"
        d="M12.804 6.66H4.486l4.457-4.457a1.295 1.295 0 0 0 0-1.83L8.942.372a1.295 1.295 0 0 0-1.83 0l-6.59 6.59a1.466 1.466 0 0 0 0 2.074l6.59 6.59a1.295 1.295 0 0 0 1.83 0l.001-.001a1.295 1.295 0 0 0 0-1.83L4.486 9.338h8.318c.715 0 1.294-.579 1.294-1.294v-.092c0-.714-.579-1.294-1.294-1.294v.002zm18.713.303l-6.59-6.59a1.295 1.295 0 0 0-1.83 0l-.001.001a1.295 1.295 0 0 0 0 1.83l4.457 4.457h-8.318c-.715 0-1.294.579-1.294 1.294v.092c0 .715.579 1.294 1.294 1.294h8.318l-4.457 4.457a1.295 1.295 0 0 0 0 1.83l.001.001a1.295 1.295 0 0 0 1.83 0l6.59-6.59a1.467 1.467 0 0 0 0-2.075v-.001z"
      />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
Icon.displayName = "Icons.DirectionB";
