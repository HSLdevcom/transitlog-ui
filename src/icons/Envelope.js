import React from "react";
import {Svg, Path} from "react-primitives-svg";
import PropTypes from "prop-types";
import {svgSize} from "../helpers/svg";

export default function Icon({fill, height, width, ...rest}) {
  return (
    <Svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 35 24"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <Path
        fill={fill}
        d="M23.0468773,12.8834877 L34.2865287,5.52752058 L34.2865287,20.2394547 L23.0468773,12.8834877 Z M32.4971314,24.1437757 L2.13329702,24.1437757 C1.12676107,24.1437757 0.343899782,23.2950103 0.343899782,22.3330761 L0.343899782,22.163323 L13.0933551,13.8454218 L16.0011256,15.7692901 C16.9517429,16.4483025 17.6227669,16.3917181 18.6293028,15.7692901 L21.5370733,13.8454218 L34.2865287,22.163323 L34.2865287,22.3330761 C34.2865287,23.2950103 33.5036674,24.1437757 32.4971314,24.1437757 Z M11.6394699,12.8834877 L0.343899782,20.2394547 L0.343899782,5.52752058 L11.6394699,12.8834877 Z M17.3431736,14.6941872 L0.399818446,3.66023663 L0.399818446,2.58513374 C0.399818446,1.56661523 1.18267974,0.774434156 2.18921569,0.774434156 L32.4412128,0.774434156 C33.4477487,0.774434156 34.23061,1.56661523 34.23061,2.58513374 L34.23061,3.66023663 L17.3431736,14.6941872 Z"
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

Icon.displayName = "Icons.Envelope";
