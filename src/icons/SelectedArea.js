import React from "react";
import {G, Path, Svg} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";
import {Colors} from "./HSL_COLORS";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 32 32"
      preserveAspectRatio="xMidYMid meet">
      <G>
        <Path
          fill={fill}
          d="M16.0117,4 C20.5987,4 24.3297,7.732 24.3297,12.319 C24.3297,15.923 18.9227,24.822 16.0117,29.213 C13.1007,24.822 7.6937,15.923 7.6937,12.319 C7.6937,7.732 11.4247,4 16.0117,4 M31.8657,32.2 L28.2397,25.63 C28.0097,25.225 27.5967,25 27.1377,25 L21.0077,25 C23.5587,20.684 26.3297,15.307 26.3297,12.319 C26.3297,6.629 21.7007,2 16.0117,2 C10.3227,2 5.6937,6.629 5.6937,12.319 C5.6937,15.307 8.4647,20.684 11.0157,25 L4.8867,25 C4.3817,25 3.9687,25.225 3.7847,25.63 L0.1577,32.2 C-0.3013,33.01 0.2957,34 1.2597,34 L30.7647,34 C31.6827,34 32.2797,33.01 31.8657,32.2"
        />
        <Path
          fill={fill}
          d="M12.8604,12.2744 C12.8604,10.5614 14.2744,9.1674 16.0114,9.1674 C17.7494,9.1674 19.1634,10.5614 19.1634,12.2744 C19.1634,14.0124 17.7494,15.4254 16.0114,15.4254 C14.2744,15.4254 12.8604,14.0124 12.8604,12.2744 M21.1634,12.2744 C21.1634,9.4584 18.8524,7.1674 16.0114,7.1674 C13.1714,7.1674 10.8604,9.4584 10.8604,12.2744 C10.8604,15.1144 13.1714,17.4254 16.0114,17.4254 C18.8524,17.4254 21.1634,15.1144 21.1634,12.2744"
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

Icon.defaultProps = {
  fill: Colors.primary.hslGrey,
};

Icon.displayName = "Icons.SelectedArea";
