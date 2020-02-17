import React from "react";
import {Svg, Path, G} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 34 34"
      preserveAspectRatio="xMidYMid meet">
      <G fill={fill} id="Mobile" fillRule="evenodd">
        <Path
          d="M19.6328125,1.37096774 L33.578125,15.3548387 C34.7265625,16.5064516 33.796875,18.4806452 32.2109375,18.4806452 L29.1484375,18.4806452 L29.1484375,34 L5.90625,34 L5.90625,18.4806452 L2.84375,18.4806452 C1.203125,18.4806452 0.328125,16.5064516 1.4765625,15.3548387 L15.421875,1.37096774 C16.5703125,0.274193548 18.484375,0.274193548 19.6328125,1.37096774 Z M9.515625,29.3387097 L13.2890625,29.3387097 L13.2890625,25.2806452 L9.515625,25.2806452 L9.515625,29.3387097 Z M9.515625,22.8129032 L13.2890625,22.8129032 L13.2890625,18.7548387 L9.515625,18.7548387 L9.515625,22.8129032 Z M15.75,29.3387097 L19.5234375,29.3387097 L19.5234375,25.2806452 L15.75,25.2806452 L15.75,29.3387097 Z M15.75,22.8129032 L19.5234375,22.8129032 L19.5234375,18.7548387 L15.75,18.7548387 L15.75,22.8129032 Z"
          id="Z"
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

Icon.displayName = "Icons.Home";
