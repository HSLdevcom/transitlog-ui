import React from "react";
import {Svg, Path, G} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 22 22"
      preserveAspectRatio="xMidYMid meet">
      <G fill={fill} id="Mobile" fillRule="evenodd">
        <Path
          d="M9.55191881,13.4670651 L8.21783284,14.8104639 L6.88374688,13.4670651 L4.77620939,11.3469396 C4.40775878,10.9760808 4.40775878,10.3743995 4.77620939,10.0035407 C5.14466,9.63268192 5.74243427,9.63268192 6.11088488,10.0035407 L8.21783284,12.1242596 L12.9157255,7.39566174 C13.2841761,7.02480295 13.8819504,7.02480295 14.250401,7.39566174 C14.6188516,7.76652052 14.6188516,8.36701506 14.250401,8.73787385 L9.55191881,13.4670651 Z M9.00018892,-0.000129411765 C6.15861839,2.19786643 3.13925126,3.76886783 -0.000128571429,4.91803809 C-0.000128571429,16.4921895 4.74513548,18.9988891 9.00018892,21.7407914 C13.2546074,18.9988891 17.9998714,16.4921895 17.9998714,4.91803809 C14.8604916,3.76886783 11.8411245,2.19786643 9.00018892,-0.000129411765 L9.00018892,-0.000129411765 Z"
          id="Fill-1"
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

Icon.displayName = "Icons.Privacy";
