import React from "react";
import {Svg, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 40 40"
      preserveAspectRatio="xMidYMid meet">
      <Path
        fill={fill}
        d="M26.8770023,20.0003648 L38.5750673,8.3022768 C40.4736807,6.40252911 40.4736807,3.32285619 38.5750673,1.42408122 C36.6774266,-0.474693741 33.5960705,-0.474693741 31.6984298,1.42408122 L20.0003647,13.1231419 L8.30229971,1.42408122 C6.40271369,-0.474693741 3.32427553,-0.474693741 1.42468951,1.42408122 C-0.474896504,3.32382892 -0.474896504,6.40350184 1.42468951,8.3022768 L13.1217819,20.0003648 L1.42468951,31.69748 C-0.474896504,33.5972277 -0.474896504,36.6769006 1.42468951,38.5766483 C3.32233023,40.4744506 6.40368634,40.4744506 8.30132706,38.5766483 L20.0003647,26.8775876 L31.6974571,38.5766483 C33.5970431,40.4744506 36.676454,40.4744506 38.57604,38.5766483 C40.4746533,36.6769006 40.4746533,33.5972277 38.57604,31.69748 L26.8770023,20.0003648 Z"
        id="Shape"
      />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.CrossThick";
