import React from "react";
import {Svg, Circle, G, Path} from "react-primitives-svg";
import PropTypes from "prop-types";

import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 48 46"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <G fill={fill}>
        <Path
          d="M10,46 L38,46 C40.6521649,46 43.195704,44.9464316 45.0710678,43.0710678 C46.9464316,41.195704 48,38.6521649 48,36 L48,34 C48,32.8954305 47.1045695,32 46,32 L38,32 L38,6 C38,2.6862915 35.3137085,4.4408921e-16 32,0 L6,0 C2.6862915,4.4408921e-16 4.4408921e-16,2.6862915 0,6 L0,36 C-2.77555756e-15,41.5228475 4.4771525,46 10,46 Z M38,42 L17.95,42 C19.2729641,40.2790026 19.9932943,38.1707191 20,36 L44,36 C44,39.3137085 41.3137085,42 38,42 Z M4,6 C4,4.8954305 4.8954305,4 6,4 L32,4 C33.1045695,4 34,4.8954305 34,6 L34,32 L18,32 C16.8954305,32 16,32.8954305 16,34 L16,36 C16,39.3137085 13.3137085,41.9999999 10,41.9999999 C6.68629154,41.9999999 4.00000005,39.3137085 4,36 L4,6 Z"
          id="Shape"
        />
        <Path
          d="M11.105,22.21 C10.4654946,22.5297527 10.0451532,23.1663885 10.0023145,23.8800927 C9.95947575,24.593797 10.3006478,25.2761412 10.8973145,25.6700928 C11.4939812,26.0640443 12.2554946,26.1097527 12.895,25.79 L14.215,25.13 C17.2333873,23.65021 20.7666127,23.65021 23.785,25.13 L25.105,25.79 C26.0935897,26.2842949 27.2957051,25.8835897 27.79,24.895 C28.2842949,23.9064103 27.8835897,22.7042949 26.895,22.21 L25.575,21.55 C21.4273476,19.5172009 16.5726524,19.5172009 12.425,21.55 L11.105,22.21 Z"
          id="Shape"
        />
        <Circle id="Oval" cx="13" cy="13" r="3" />
        <Circle id="Oval" cx="25" cy="13" r="3" />
      </G>
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.SomethingWrong";
