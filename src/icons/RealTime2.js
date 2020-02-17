import React from "react";
import {Svg, G, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";
import {Colors} from "./HSL_COLORS";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet">
      <G fillRule="evenodd">
        <Path
          id="Fill-1"
          fill={fill && fill.inner ? fill.inner : Colors.secondary.hslGreenLight}
          d="M9.35848,2.36672 C9.78248,2.24112 10.02328,1.79552 9.89688,1.37232 C9.77128,0.94832 9.32728,0.70752 8.90248,0.83392 C5.00968,1.99232 1.99288,5.00832 0.83368,8.90192 C0.70728,9.32512 0.94888,9.77072 1.37208,9.89632 C1.44808,9.91872 1.52488,9.92992 1.60008,9.92992 C1.94568,9.92992 2.26328,9.70592 2.36648,9.35792 C3.37208,5.98432 5.98568,3.37152 9.35848,2.36672 Z"
        />
        <Path
          id="Fill-3"
          fill={fill && fill.inner ? fill.inner : Colors.secondary.hslGreenLight}
          d="M4.26704,8.80968 C4.09024,9.21448 4.27504,9.68568 4.67984,9.86248 C4.78384,9.90888 4.89264,9.92968 4.99904,9.92968 C5.30784,9.92968 5.60144,9.75048 5.73264,9.45048 C6.46224,7.78328 7.78304,6.46248 9.45104,5.73288 C9.85584,5.55608 10.04064,5.08408 9.86304,4.68008 C9.68784,4.27608 9.21744,4.08888 8.81024,4.26728 C6.77104,5.15848 5.15824,6.77208 4.26704,8.80968 Z"
        />
        <Path
          id="Fill-5"
          fill={fill && fill.outer ? fill.outer : fill}
          d="M11.96728,13.84224 C12.08248,13.90064 12.20648,13.92944 12.33048,13.92944 C12.49608,13.92944 12.66168,13.87824 12.80088,13.77664 L15.72568,11.65184 C16.08328,11.39184 16.16248,10.89184 15.90248,10.53424 C15.64328,10.17664 15.14328,10.09744 14.78488,10.35824 L13.13048,11.55904 L13.13048,7.52944 C13.13048,7.08784 12.77288,6.72944 12.33048,6.72944 C11.88808,6.72944 11.53048,7.08784 11.53048,7.52944 L11.53048,13.12944 C11.53048,13.43024 11.69928,13.70624 11.96728,13.84224"
        />
        <Path
          id="Fill-7"
          fill={fill && fill.outer ? fill.outer : fill}
          d="M11.93456,2.67192 C11.87936,3.33192 12.37136,3.91192 13.03216,3.96632 C17.34816,4.32312 20.73056,7.99672 20.73056,12.32952 C20.73056,16.96152 16.96256,20.72952 12.33056,20.72952 C7.99776,20.72952 4.32336,17.34792 3.96656,13.03032 C3.91136,12.36952 3.32096,11.88792 2.67136,11.93352 C2.01136,11.98872 1.51936,12.56792 1.57456,13.22872 C2.03376,18.78072 6.75856,23.12952 12.33056,23.12952 C18.28576,23.12952 23.13056,18.28552 23.13056,12.32952 C23.13056,6.75752 18.78096,2.03272 13.22896,1.57432 C12.57056,1.52152 11.98896,2.01032 11.93456,2.67192 Z"
        />
      </G>
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      inner: PropTypes.string,
      outer: PropTypes.string,
    }),
  ]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.defaultProps = {
  fill: {
    inner: Colors.secondary.hslGreenLight,
    outer: Colors.primary.hslGreyDark,
  },
};

Icon.displayName = "Icons.RealTime2";
