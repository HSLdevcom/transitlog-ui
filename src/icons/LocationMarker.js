import React from "react";
import {Svg, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 23 34"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <Path
        fill={fill}
        d="M22.9669565,11.3856061 C22.9669565,17.6484848 11.853913,34.0306061 11.853913,34.0306061 C11.853913,34.0306061 0.740869565,17.6495455 0.740869565,11.3856061 C0.740869565,5.17575758 5.69217391,0.0901515152 11.853913,0.0901515152 C18.0156522,0.0901515152 22.9669565,5.17575758 22.9669565,11.3856061 L22.9669565,11.3856061 Z M16.8041739,11.3325758 C16.8041739,8.60257576 14.592,6.35409091 11.8528696,6.35409091 C9.11373913,6.35409091 6.90156522,8.60257576 6.90156522,11.3325758 C6.90156522,14.1166667 9.11373913,16.3651515 11.8528696,16.3651515 C14.592,16.3651515 16.8041739,14.1166667 16.8041739,11.3325758 Z"
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

Icon.displayName = "Icons.LocationMarker";
