import "@testing-library/jest-dom/extend-expect";
import React from "react";
import HfpMarkerLayer from "./HfpMarkerLayer";
import {Map, TileLayer, Pane} from "react-leaflet";
import {render, cleanup} from "@testing-library/react";
import VehicleMarker from "./VehicleMarker";

describe("HfpMarkerLayer", () => {
  afterEach(cleanup);

  test("Renders a marker for a journey", async () => {
    const event = {
      lat: 60,
      lng: 30,
    };

    const journey = {
      mode: "BUS",
    };

    const {lat, lng} = event;
    const markerRef = React.createRef();

    render(
      <Map center={[lat, lng]} zoom={13}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Pane name="hfp-markers" style={{zIndex: 430}} />
        <HfpMarkerLayer ref={markerRef} journey={journey} currentEvent={event} />
      </Map>
    );

    // Nice path
    expect(markerRef.current.markerRef.current.leafletElement._latlng).toEqual({
      lat,
      lng,
    });
  });

  test("The icon gets the correct color and vehicle icon", () => {
    const event = {
      velocity: 10,
      heading: 45,
    };

    const {getByTestId} = render(
      <VehicleMarker mode="BUS" isSelectedJourney={true} event={event} />
    );

    expect(getByTestId("icon-icon").className).toContain("BUS");
  });
});
