import React from "react";
import {Svg, Path, Circle, G} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgTranslate, svgSize} from "../helpers/svg";
import {Colors} from "./HSL_COLORS";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 18 18"
      preserveAspectRatio="xMidYMid meet">
      <G id="Routes">
        <G id="hsl-app_routes_08" {...svgTranslate(-193.0, -445.0)}>
          <G id="icon-user-nearest-stop" {...svgTranslate(193.0, 445.0)}>
            <Path
              d="M9,0 C4.029,0 0,4.029 0,9 C0,13.971 4.029,18 9,18 C13.971,18 18,13.971 18,9 C18,4.029 13.971,0 9,0 M9,1.5 C13.136,1.5 16.5,4.864 16.5,9 C16.5,13.136 13.136,16.5 9,16.5 C4.864,16.5 1.5,13.136 1.5,9 C1.5,4.864 4.864,1.5 9,1.5"
              id="Fill-3"
              fill={fill.outer}
            />
            <Circle id="Oval" fill={fill.outer} cx="9" cy="9" r="6" />
            <G id="icon-User-white" {...svgTranslate(5.5, 5.0)} strokeWidth="1">
              <G id="Page-1">
                <G id="Group-3" transform="translate(1.461847, 0.021951)">
                  <Path
                    d="M2.03888072,4.09450386 L2.06572811,4.09450386 C3.16562771,4.09450386 4.07782048,3.16706526 4.07782048,2.04198456 C4.07782048,0.91690386 3.16562771,0.00611087719 2.06572811,0.00611087719 C0.938953012,0.00611087719 0.0268164659,0.91690386 0.0268164659,2.04198456 C0.0268164659,3.16706526 0.938953012,4.09450386 2.03888072,4.09450386 Z"
                    id="Fill-1"
                    fill={fill.inner}
                  />
                </G>
                <G id="Group-6" {...svgTranslate(0.0, 4.176)}>
                  <Path
                    d="M6.4100996,0.963612632 C6.18579036,0.266910877 5.7943245,0.0243284211 5.17129639,0.0243284211 L4.67289076,0.0243284211 C4.67289076,0.0243284211 4.17932048,0.563444211 3.48873815,0.563444211 C2.78066988,0.563444211 2.30554137,0.0243284211 2.30554137,0.0243284211 L1.80716386,0.0243284211 C1.18410763,0.0243284211 0.804589558,0.266910877 0.555400803,0.963612632 C0.555400803,0.963612632 -0.00206907631,2.92105825 -1.68674699e-05,3.17486877 C0.00138875502,3.34514246 0.115918876,3.48097404 0.270003213,3.53194947 C0.430412851,3.60414596 0.775718072,3.66935298 1.24564578,3.71825123 L1.45826024,2.35415298 L1.6605012,2.35415298 L1.6605012,3.12717754 L1.6605012,3.75457404 C2.19463775,3.79434947 2.83343695,3.81753544 3.51763775,3.81753544 C4.20054538,3.81753544 4.83720803,3.79440561 5.37134458,3.75477053 L5.37134458,3.12692491 L5.37134458,2.35415298 L5.57001526,2.35415298 L5.5768747,2.35415298 L5.79752932,3.7163986 C6.26773815,3.66660211 6.61014779,3.60117053 6.76307952,3.52793544 C6.8924249,3.48021614 6.97749317,3.36633544 6.97749317,3.17509333 C6.97746506,2.92131088 6.4100996,0.963612632 6.4100996,0.963612632"
                    id="Fill-4"
                    fill={fill.inner}
                    mask="url(#mask-4)"
                  />
                </G>
              </G>
            </G>
          </G>
        </G>
      </G>
    </Svg>
  );
}

Icon.propTypes = {
  fill: PropTypes.shape({
    inner: PropTypes.string,
    outer: PropTypes.string,
  }),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.defaultProps = {
  fill: {
    inner: Colors.primary.hslWhite,
    outer: Colors.secondary.hslPinkDark,
  },
};

Icon.displayName = "Icons.UserNearestStop";
