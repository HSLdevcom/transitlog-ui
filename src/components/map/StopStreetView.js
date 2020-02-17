import React from "react";
import {latLng} from "leaflet";
import styled from "styled-components";
import MapillaryViewer from "./MapillaryViewer";

const StopStreetViewer = styled(MapillaryViewer)`
  width: 500px;
  height: 300px;
  margin-top: 1rem;
`;

export default function StopStreetView({stop}) {
  return (
    <StopStreetViewer
      elementId={`stop_view_${stop.stopId}`}
      location={latLng({lat: stop.lat, lng: stop.lon})}
    />
  );
}
