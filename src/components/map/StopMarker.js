import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {Popup, CircleMarker, Circle} from "react-leaflet";
import {latLng} from "leaflet";
import {Heading} from "../Typography";
import get from "lodash/get";
import styled from "styled-components";
import {app} from "mobx-app";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";

const StopRouteList = styled.button`
  text-decoration: none;
  padding: 2px 4px;
  border-radius: 3px;
  background: #e6e6e6;
  margin: 0 0 3px 3px;
  display: inline-block;
  border: 0;
  cursor: pointer;
`;

@inject(app("Filters"))
@observer
class StopMarker extends Component {
  selectRoute = (route) => () => {
    if (route) {
      this.props.Filters.setRoute(route);
    }
  };

  selectStop = () => {
    const {stop, Filters} = this.props;

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

    const selected = selectedStop === stop.stopId;
    const mode = getPriorityMode(get(stop, "modes.nodes", []));
    const stopColor = getModeColor(mode);
    const {stopRadius} = stop;

    const markerPosition = [stop.lat, stop.lon];

    const markerElement = (
      <CircleMarker
        pane="stops"
        center={markerPosition}
        color={stopColor}
        fillColor={selected ? stopColor : "white"}
        fillOpacity={1}
        onClick={this.selectStop}
        radius={selected ? 10 : 8}>
        <Popup
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
            <StopRouteList
              key={`route_${routeSegment.routeId}_${routeSegment.direction}`}
              onClick={this.selectRoute(get(routeSegment, "route.nodes[0]", null))}>
              {routeSegment.routeId.substring(1).replace(/^0+/, "")}
            </StopRouteList>
          ))}
          <button onClick={this.onShowStreetView}>Show in street view</button>
        </Popup>
      </CircleMarker>
    );

    return showRadius ? (
      <Circle
        center={markerPosition}
        weight={1}
        opacity={0.5}
        color={stopColor}
        fillColor={stopColor}
        fillOpacity={0.15}
        radius={stopRadius}>
        {markerElement}
      </Circle>
    ) : (
      markerElement
    );
  }
}

export default StopMarker;
