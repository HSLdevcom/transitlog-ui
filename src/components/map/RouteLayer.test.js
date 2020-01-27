/* eslint-disable import/first */
const {Map, TileLayer, Pane} = jest.requireActual("react-leaflet");

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import "jest-styled-components";
import {cleanup} from "@testing-library/react";
import RouteLayer from "./RouteLayer";
import {renderComponent} from "../../__tests__/util/renderComponent";

describe("RouteLayer", () => {
  const {render, onBeforeEach} = renderComponent((props) => (
    <Map center={[60.0, 24.0]} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Pane name="route-lines" style={{zIndex: 430}} />
      <RouteLayer {...props} UI={{setMapView: () => {}}} />
    </Map>
  ));

  beforeEach(onBeforeEach);
  afterEach(cleanup);

  test("Renders RouteLayer with coordinates", () => {
    const coordinates = [
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4],
    ];

    const {getByText} = render({
      coordinates: coordinates,
    });

    expect(getByText("0,0,4,0,4,4,0,4")).toBeInTheDocument();
  });
});
