import React from "react";
import {Svg, Path} from "react-primitives-svg";
import PropTypes from "prop-types";

import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 28 30"
      preserveAspectRatio="xMidYMid meet">
      <Path
        fill={fill}
        d="M3.688,0.448 L13.48,0.448 C15.208,0.448 16.552,1.84 16.552,3.52 L16.552,26.128 C16.552,27.808 15.208,29.2 13.48,29.2 L3.688,29.2 C2.008,29.2 0.616,27.808 0.616,26.128 L0.616,3.52 C0.616,1.84 2.008,0.448 3.688,0.448 Z M7.192,27.184 L9.976,27.184 C10.264,27.184 10.456,26.944 10.456,26.656 C10.456,26.416 10.264,26.176 9.976,26.176 L7.192,26.176 C6.952,26.176 6.712,26.416 6.712,26.656 C6.712,26.944 6.952,27.184 7.192,27.184 Z M2.44,24.016 L14.776,24.016 L14.776,2.8 L2.44,2.8 L2.44,24.016 Z M19.288,12.64 C19.096,12.64 18.856,12.592 18.712,12.4 C18.424,12.112 18.424,11.584 18.712,11.296 C20.056,9.952 20.056,7.744 18.712,6.352 C18.424,6.064 18.424,5.536 18.712,5.248 C19.048,4.96 19.528,4.96 19.816,5.248 C21.832,7.216 21.832,10.432 19.816,12.4 C19.672,12.592 19.48,12.64 19.288,12.64 Z M21.4,14.752 C21.208,14.752 21.016,14.704 20.824,14.56 C20.536,14.224 20.536,13.744 20.824,13.408 C22.072,12.208 22.744,10.576 22.744,8.848 C22.744,7.12 22.072,5.488 20.824,4.24 C20.536,3.952 20.536,3.424 20.824,3.136 C21.16,2.8 21.64,2.8 21.976,3.136 C23.464,4.624 24.328,6.688 24.328,8.848 C24.328,11.008 23.464,13.024 21.976,14.56 C21.784,14.704 21.592,14.752 21.4,14.752 Z M23.512,16.912 C23.32,16.912 23.128,16.816 22.984,16.672 C22.648,16.336 22.648,15.856 22.984,15.568 C24.76,13.744 25.768,11.392 25.768,8.848 C25.768,6.304 24.76,3.904 22.984,2.128 C22.648,1.792 22.648,1.312 22.984,0.976 C23.272,0.688 23.8,0.688 24.088,0.976 C26.2,3.088 27.352,5.872 27.352,8.848 C27.352,11.776 26.2,14.56 24.088,16.672 C23.944,16.816 23.752,16.912 23.512,16.912 Z"
      />
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.MobileTicket";
