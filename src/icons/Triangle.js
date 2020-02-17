import React from "react";
import {Svg, Path, G} from "react-primitives-svg";
import PropTypes from "prop-types";

import {svgSize, svgTranslate} from "../helpers/svg";

export default function Icon({stroke, fill, height, width, ...rest}) {
  return (
    <Svg {...rest} {...svgSize(height, width)} viewBox="0 0 16 15">
      <G>
        <G {...svgTranslate(2, 2)}>
          <G>
            <Path
              stroke={stroke}
              strokeWidth={2}
              fill={fill}
              d="M3.83387719,0.463539147 L3.83393442,0.463440038 C4.7959989,-1.20233037 7.19914914,-1.20233037 8.16127086,0.463539147 L12.6587053,8.25269858 C13.6192846,9.9183687 12.4176179,12 10.4951726,12 L1.50083177,12 C-0.422214924,12 -1.62426388,9.91858953 -0.663293205,8.25224095 L3.83387719,0.463539147 Z"
            />
          </G>
        </G>
      </G>
    </Svg>
  );
}

Icon.propTypes = {
  stroke: PropTypes.string,
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.defaultProps = {
  stroke: "#FFFFFF",
};

Icon.displayName = "Icons.Triangle";
