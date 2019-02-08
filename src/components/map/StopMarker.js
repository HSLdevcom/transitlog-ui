import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {Popup, CircleMarker} from "react-leaflet";
import {latLng} from "leaflet";
import {Heading} from "../Typography";
import get from "lodash/get";
import styled from "styled-components";
import {app} from "mobx-app";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import {StopRadius} from "./StopRadius";
import {observable, action} from "mobx";
import {Text} from "../../helpers/text";

const StopOptionButton = styled.button`
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  background: var(--lightest-grey);
  margin: 0 0 0.5rem 0;
  display: block;
  border: ${({color = "var(--lightest-grey)"}) =>
    color ? `3px solid ${color}` : "3px solid var(--lightest-grey)"};
  cursor: pointer;

  &:hover {
    background-color: var(--lighter-grey);
  }
`;

function cleanRouteId(routeId) {
  return routeId.substring(1).replace(/^0+/, "");
}

@inject(app("Filters"))
@observer
class StopMarker extends Component {
  @observable
  popupOpen = false;

  togglePopupOpen = action((setTo = !this.popupOpen) => {
    this.popupOpen = setTo;
  });

  selectRoute = (route) => () => {
    if (route) {
      this.props.Filters.setRoute(route);
    }
  };

  selectStop = () => {
    const {stop, Filters} = this.props;

    this.togglePopupOpen();

    if (stop) {
      Filters.setStop(stop.stopId);
    }
  };

  onShowStreetView = (e) => {
    const {onViewLocation, stop} = this.props;
    onViewLocation(latLng({lat: stop.lat, lng: stop.lon}));
  };

  render() {
    const {stop, state, showRadius = true} = this.props;
    const {stop: selectedStop} = state;

    const isSelected = selectedStop === stop.stopId;
    const mode = getPriorityMode(get(stop, "modes.nodes", []));
    const stopColor = getModeColor(mode);
    const {stopRadius} = stop;

    const markerPosition = latLng(stop.lat, stop.lon);

    const markerElement = (
      <CircleMarker
        pane="stops"
        center={markerPosition}
        color={stopColor}
        fillColor={isSelected ? stopColor : "white"}
        fillOpacity={1}
        onClick={this.selectStop}
        radius={isSelected ? 10 : 8}
      />
    );

    const stopMarkerElement = showRadius ? (
      <StopRadius
        // The "pane" prop on the Circle element is not dynamic, so the
        // StopRadius component should be remounted when selected or
        // deselected for the circle to appear on the correct layer.
        key={`stop_radius_${stop.stopId}${isSelected ? "_selected" : ""}`}
        isHighlighted={isSelected}
        center={markerPosition}
        color={stopColor}
        radius={stopRadius}>
        {markerElement}
      </StopRadius>
    ) : (
      markerElement
    );

    const popupElement = (
      <Popup
        position={markerPosition}
        autoPan={false}
        autoClose={false}
        keepInView={false}
        minWidth={300}
        maxHeight={750}
        maxWidth={550}>
        <Heading level={4}>
          {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Heading>
        {get(stop, "routeSegmentsForDate.nodes", []).map((routeSegment) => (
          <StopOptionButton
            color={stopColor}
            key={`route_${cleanRouteId(routeSegment.routeId)}_${
              routeSegment.direction
            }_${routeSegment.dateBegin}_${routeSegment.dateEnd}`}
            onClick={this.selectRoute(get(routeSegment, "route.nodes[0]", null))}>
            {cleanRouteId(routeSegment.routeId)}
          </StopOptionButton>
        ))}
        <button onClick={this.onShowStreetView}>
          <Text>map.stops.show_in_streetview</Text>
        </button>
      </Popup>
    );

    return (
      <>
        {stopMarkerElement}
        {this.popupOpen && popupElement}
      </>
    );
  }
}

export default StopMarker;
