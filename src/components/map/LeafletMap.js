import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import get from "lodash/get";

export class LeafletMap extends Component {
  mapRef = React.createRef();

  onViewportChange = (cb = () => {}) => (viewport) => {
    cb(get(this.mapRef, "current.leafletElement", null), viewport);
  };

  render() {
    const {
      children,
      center,
      zoom,
      bounds,
      onMapChange = () => {},
      onMapChanged = () => {},
    } = this.props;

    return (
      <Map
        ref={this.mapRef}
        center={center}
        zoom={zoom}
        bounds={!center ? bounds : undefined}
        maxZoom={20}
        zoomControl={false}
        onViewportChanged={this.onViewportChange(onMapChanged)}
        onViewportChange={this.onViewportChange(onMapChange)}>
        <Pane name="route-lines" style={{zIndex: 410}} />
        <Pane name="hfp-lines" style={{zIndex: 420}} />
        <Pane name="hfp-markers" style={{zIndex: 430}} />
        <Pane name="stops" style={{zIndex: 450}} />
        <TileLayer
          attribution={
            'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors '
          }
          url="https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}@2x.png"
          tileSize={512}
          zoomOffset={-1}
        />
        <ZoomControl position="topright" />
        {children}
      </Map>
    );
  }
}
