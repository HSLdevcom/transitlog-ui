import React from "react";
import get from "lodash/get";
import styled from "styled-components";
import {getModeColor} from "../../helpers/vehicleColor";

const IconWrapper = styled.span`
  width: 100%;
  height: 100%;
  display: block;
  padding: 3px;
  border-radius: 50%;
  position: relative;
  background-color: ${({color}) => color};
`;

const Icon = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: relative;
  z-index: 10;
  overflow: hidden;
  transform: ${({rotation}) => `rotate(${rotation}deg)`};

  &:before {
    content: " ";
    width: 90%;
    height: 90%;
    margin: 0 0 1px;
    display: block;
  }
`;

const Indicator = styled.span`
  position: absolute;
  z-index: 10;
  bottom: calc(50% - 6px);
  right: ${({position = "right"}) => (position === "right" ? "-7px" : "auto")};
  left: ${({position = "left"}) => (position === "left" ? "-7px" : "auto")};
  background: ${({color = "var(--dark-blue)"}) => color};
  border: 2px solid white;
  width: 12px;
  height: 12px;
  border-radius: 50%;
`;

const RotationWrapper = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform-origin: center;
  transform: ${({rotation}) => `rotate(${rotation}deg)`};
  z-index: 1;
`;

const HeadingArrow = styled.span`
  width: 0;
  height: 0;
  position: absolute;
  top: -29px;
  left: 5px;
  border-width: 17px 13px;
  border-color: transparent transparent ${({color = "var(--blue)"}) => color}
    transparent;
  border-style: solid;
  z-index: 0;
`;

// Creates a portal that renders the vehicle markers

class VehicleMarker extends React.Component {
  render() {
    const {position} = this.props;

    const color = getModeColor(get(position, "mode", "").toUpperCase());

    // The spd value can be a bit flaky, so I decided that under 2 m/s is stopped enough.
    const isStopped = position.spd < 2;

    return (
      <IconWrapper color={color} isStopped={isStopped} data-testid="hfp-marker-icon">
        <Icon
          data-testid="icon-icon"
          // The mode className applies the vehicle icon
          className={get(position, "mode", "BUS").toUpperCase()}
        />
        <RotationWrapper
          rotation={get(position, "hdg", 0)}
          data-testid="icon-rotation">
          {position.drst && <Indicator position="right" color="var(--dark-blue)" />}
          {position.full && <Indicator position="left" color="var(--red)" />}
          {!isStopped && (
            <HeadingArrow className="hfp-marker-heading" color={color} />
          )}
        </RotationWrapper>
      </IconWrapper>
    );
  }
}

export default VehicleMarker;
