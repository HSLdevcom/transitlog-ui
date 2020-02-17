import React from "react";
import {Svg, Path, G} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 20 25"
      preserveAspectRatio="xMidYMid meet">
      <G fill={fill} fillRule="evenodd">
        <Path
          d="M18,7.5 L18,22.08455 L2,22.08455 L2,2.00005 L12.5005,2.00005 L12.689,2.18905 L12.689,5.33055 C12.689,6.33255 13.5015,7.14405 14.503,7.14405 L17.645,7.14405 L18,7.5 Z M13.5945,0.26555 C13.4245,0.09555 13.194,5e-05 12.9535,5e-05 L1.814,5e-05 C0.812,5e-05 -3.05533376e-13,0.81205 -3.05533376e-13,1.81355 L-1.52766688e-13,22.27105 C-1.52766688e-13,23.27255 0.812,24.08455 1.814,24.08455 L18.1865,24.08455 C19.188,24.08455 20,23.27255 20,22.27105 L20,6.88055 C20,6.63955 19.9045,6.40855 19.7345,6.23905 L13.5945,0.26555 Z"
          id="Fill-1"
        />
        <Path
          d="M5.00359622,10 L8.99640378,10 C9.55089069,10 10,9.552 10,9 C10,8.448 9.55089069,8 8.99640378,8 L5.00359622,8 C4.44961111,8 4,8.448 4,9 C4,9.552 4.44961111,10 5.00359622,10"
          id="Fill-4"
        />
        <Path
          d="M4,13 C4,13.552 4.45265861,14 5.01039869,14 L14.9896013,14 C15.5473414,14 16,13.552 16,13 C16,12.448 15.5473414,12 14.9896013,12 L5.01039869,12 C4.45265861,12 4,12.448 4,13"
          id="Fill-6"
        />
        <Path
          d="M14.9896013,16 L5.01039869,16 C4.45265861,16 4,16.448 4,17 C4,17.552 4.45265861,18 5.01039869,18 L14.9896013,18 C15.5473414,18 16,17.552 16,17 C16,16.448 15.5473414,16 14.9896013,16"
          id="Fill-8"
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

Icon.displayName = "Icons.Terms";
