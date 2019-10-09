import React, {useCallback, useEffect, useRef} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import {latLng} from "leaflet";
import get from "lodash/get";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import {StopRadius} from "./StopRadius";
import {flow} from "lodash";
import {inject} from "../../helpers/inject";
import StopPopupContent from "./StopPopupContent";
import MapPopup from "./MapPopup";
import DivIcon from "./DivIcon";
import AlertIcons from "../AlertIcons";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";
import TimingStop from "../../icons/TimingStop";
import {Tooltip} from "react-leaflet";

const decorate = flow(
  observer,
  inject("Filters")
);

export const StopMarkerCircle = styled.div`
  width: ${({isSelected, big}) => (isSelected && big ? "2rem" : big ? "1.5rem" : "1rem")};
  height: ${({isSelected, big}) =>
    isSelected && big ? "2rem" : big ? "1.5rem" : "1rem"};
  border-radius: 50%;
  border: ${({isTimingStop, dashed}) => (isTimingStop && !dashed ? 0 : "3px")}
    ${({dashed}) => (dashed ? "dashed" : "solid")}
    ${({isSelected, color = "var(--blue)"}) => (isSelected ? "var(--blue)" : color)};
  background-color: ${({
    isTimingStop,
    isHighlighted,
    isSelected,
    color = "var(--blue)",
  }) =>
    isTimingStop
      ? "white"
      : isHighlighted
      ? "var(--grey)"
      : isSelected
      ? color
      : "white"};
  align-items: center;
  justify-content: center;
  color: ${({color = "var(--blue)"}) => color};
  font-weight: bold;
  display: flex;
  font-size: 0.95rem;
  line-height: 1.1;
  background-clip: ${({isSelected}) => (isSelected ? "content-box" : "border-box")};
  padding: ${({isSelected}) => (isSelected ? "2px" : "0")};
  transform: ${({isHighlighted}) => (isHighlighted ? "scale(1.5)" : "scale(1)")};
  box-shadow: ${({isHighlighted}) =>
    isHighlighted ? "0 0 20px 0 rgba(0,0,0,0.25)" : "none"};
  position: relative;
  z-index: ${({isHighlighted}) => (isHighlighted ? "10" : "auto")};
  transition: all 0.05s ease-out;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

export const IconWrapper = styled.div`
  position: relative;
  transform: translate(-50%, -50%);
`;

export const MarkerIcons = styled(AlertIcons)`
  display: flex;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 100%);
`;

const StopMarker = decorate(
  ({
    stop,
    position = null,
    mode = "BUS",
    color,
    dashedBorder = false,
    state,
    showRadius = true,
    isTerminal = false,
    isTimingStop = false,
    onViewLocation,
    Filters,
    alerts = [],
    children,
    iconChildren,
    markerRef: ref,
    selected,
  }) => {
    const popupOpen = useRef(false);
    const defaultRef = useRef(null);
    const markerRef = ref || defaultRef;

    const {stop: selectedStop, highlightedStop} = state;

    const isSelected =
      typeof selected !== "undefined" ? !!selected : stop && selectedStop === stop.stopId;

    const isHighlighted = stop && highlightedStop === stop.stopId;

    useEffect(() => {
      // If this component was supplied a ref, that means that the popup
      // opening logic is handled in the parent.
      if (ref || children || !markerRef.current) {
        return;
      }

      if (isSelected && !popupOpen.current) {
        markerRef.current.leafletElement.openPopup();
        popupOpen.current = true;
      } else if (!isSelected && popupOpen.current) {
        markerRef.current.leafletElement.closePopup();
      }
    }, [children, ref, isSelected, markerRef.current, popupOpen.current]);

    const selectRoute = useCallback(
      (route) => () => {
        if (route) {
          Filters.setRoute(route);
        }
      },
      []
    );

    const selectStop = useCallback(() => {
      if (stop) {
        Filters.setStop(stop.stopId);
      }
    }, [stop]);

    const {lat, lng} = stop || position || {};

    if (!stop && !position) {
      return null;
    }

    const stopIsTimingStop = isTimingStop || !!get(stop, "isTimingStop", false);
    const stopMode = !stop ? mode : getPriorityMode(get(stop, "modes", []));
    const stopColor = color ? color : getModeColor(stopMode);

    const popupElement = children ? (
      children
    ) : stop ? (
      <MapPopup
        onClose={() => (popupOpen.current = false)}
        onOpen={() => (popupOpen.current = true)}>
        <StopPopupContent
          stop={stop}
          color={stopColor}
          onSelectRoute={selectRoute}
          onShowStreetView={onViewLocation}
        />
      </MapPopup>
    ) : null;

    const markerPosition = latLng({lat, lng});
    const stopAlerts =
      alerts && alerts.length !== 0 ? alerts : getAlertsInEffect(stop, state.date);

    const markerIcon = (
      <IconWrapper>
        <StopMarkerCircle
          thickBorder={isTerminal}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
          isTimingStop={stopIsTimingStop}
          dashed={dashedBorder}
          big={!!(iconChildren || isSelected || isTerminal || stopIsTimingStop)}
          color={stopColor}>
          {stopIsTimingStop ? <TimingStop fill={stopColor} /> : iconChildren}
        </StopMarkerCircle>
        {stopAlerts.length !== 0 && (
          <MarkerIcons iconSize="0.875rem" alerts={stopAlerts} />
        )}
      </IconWrapper>
    );

    const markerElement = (
      <DivIcon
        ref={markerRef}
        pane="stops"
        position={markerPosition}
        icon={markerIcon}
        onClick={selectStop}>
        {stop && (
          <Tooltip offset={[15, 0]} interactive={false} direction="right">
            <div>
              <strong>{stop.shortId.replace(/\s*/g, "")}</strong> {stop.stopId}
            </div>
            <div style={{fontSize: "1rem"}}>{stop.name}</div>
          </Tooltip>
        )}
        {popupElement}
      </DivIcon>
    );

    return showRadius ? (
      <StopRadius
        // The "pane" prop on the Circle element is not dynamic, so the
        // StopRadius component should be remounted when selected or
        // deselected for the circle to appear on the correct layer.
        key={`stop_radius_${get(stop, "stopId", selectedStop)}${
          isSelected ? "_selected" : ""
        }`}
        isHighlighted={isSelected}
        center={markerPosition}
        color={stopColor}
        radius={get(stop, "radius", 0)}>
        {markerElement}
      </StopRadius>
    ) : (
      markerElement
    );
  }
);

export default StopMarker;
