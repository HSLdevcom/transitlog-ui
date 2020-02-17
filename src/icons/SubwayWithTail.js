import React from "react";
import {Circle, Defs, G, LinearGradient, Path, Stop, Svg} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize, svgTranslate} from "../helpers/svg";
import {Colors} from "./HSL_COLORS";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 24 54"
      preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient
          x1="50%"
          y1="0%"
          x2="50%"
          y2="97.8555485%"
          id="SubwayWithTail-linearGradient-1">
          <Stop stopColor={fill} stopOpacity="0" offset="0%" />
          <Stop stopColor={fill} stopOpacity="0.5" offset="100%" />
        </LinearGradient>
      </Defs>
      <G
        id="icon-subway-live"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd">
        <Path
          fill="url(#SubwayWithTail-linearGradient-1)"
          d="M12,54 C18.627417,54 24,48.627417 24,42 C24,35.372583 18.627417,0 12,0 C5.372583,0 0,35.372583 0,42 C0,48.627417 5.372583,54 12,54 Z"
          id="tail"
        />
        <G {...svgTranslate(0.0, 30.0)}>
          <Circle id="Oval-3" fill={fill} cx="12" cy="12" r="12" />
          <G id="icon-subway" {...svgTranslate(3.0, 3.0)}>
            <G id="icon_subway">
              <G id="Group-3" fill={fill}>
                <Path
                  d="M15.3,17.46 L2.7,17.46 C1.5069375,17.46 0.54,16.4930625 0.54,15.3 L0.54,2.7 C0.54,1.5069375 1.5069375,0.54 2.7,0.54 L15.3,0.54 C16.4930625,0.54 17.46,1.5069375 17.46,2.7 L17.46,15.3 C17.46,16.4930625 16.4930625,17.46 15.3,17.46 Z"
                  id="Fill-1"
                />
              </G>
              <Path
                fill="#FFFFFF"
                d="M12.945739,6.82979764 L12.945739,6.45180824 C12.945739,6.42952927 12.9909838,6.40731306 13.0361648,6.40731306 L13.0361648,15.48 L15.84,15.48 L15.84,2.16 L11.7021143,2.16 L9.10172095,11.2549659 L9.05654,11.8775847 L8.98870476,11.8775847 L8.92086952,11.2549659 L6.32054,2.16 L2.16,2.16 L2.16,15.48 L5.00908,15.48 L5.00908,6.40731306 C5.03167048,6.40731306 5.07685143,6.42952927 5.07685143,6.45180824 L5.07685143,6.82979764 L7.60940953,15.48 L10.3906543,15.48 L12.945739,6.82979764 Z"
                id="Fill-4"
              />
            </G>
          </G>
        </G>
      </G>
    </Svg>
  );
}

Icon.defaultProps = {
  fill: Colors.transport.subway,
};

Icon.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.displayName = "Icons.SubwayWithTail";
