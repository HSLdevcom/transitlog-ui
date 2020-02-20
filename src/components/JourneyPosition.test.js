import React from "react";
import "@testing-library/jest-dom/extend-expect";
import {cleanup} from "@testing-library/react";
import JourneyPosition from "./JourneyPosition";
import {renderComponent} from "../__tests__/util/renderComponent";

describe("JourneyPosition", () => {
  const {render, onBeforeEach} = renderComponent((props) => (
    <JourneyPosition {...props} />
  ));

  beforeEach(onBeforeEach);
  afterEach(cleanup);

  test("Finds the event that matches the current time.", () => {
    const journeys = [
      {
        id: "test",
        events: [],
        vehiclePositions: [
          {recordedAtUnix: 1, lat: 1, lng: 1},
          {recordedAtUnix: 10, lat: 1, lng: 1},
          {recordedAtUnix: 20, lat: 1, lng: 1},
        ],
      },
    ];

    // Return null from the mock to appease React.
    const childrenMock = jest.fn().mockReturnValue(null);

    render({
      journeys,
      // This component is a HoC that calls children as a function with the result
      children: childrenMock,
      state: {
        live: false,
        isLiveAndCurrent: false,
        unixTime: 12, // Query for an event matching time 2.
      },
    });

    expect(childrenMock).toHaveBeenCalledTimes(1);
    expect(childrenMock.mock.calls[0][0]).toBeInstanceOf(Map);
    expect(childrenMock.mock.calls[0][0].get("test")).toHaveProperty(
      "recordedAtUnix",
      10 // It selects the event with time 2.
    );
  });

  test("Finds an event close to the current time if no events match perfectly", () => {
    const journeys = [
      {
        id: "test",
        events: [],
        vehiclePositions: [
          {recordedAtUnix: 10, lat: 1, lng: 1},
          {recordedAtUnix: 20, lat: 1, lng: 1},
          {recordedAtUnix: 30, lat: 1, lng: 1},
        ],
      },
    ];

    const childrenMock = jest.fn().mockReturnValue(null);

    render({
      journeys,
      children: childrenMock,
      state: {
        live: false,
        isLiveAndCurrent: false,
        unixTime: 22, // Query for an event matching time 22.
      },
    });

    expect(childrenMock).toHaveBeenCalledTimes(1);
    expect(childrenMock.mock.calls[0][0]).toBeInstanceOf(Map);
    expect(childrenMock.mock.calls[0][0].get("test")).toHaveProperty(
      "recordedAtUnix",
      20 // 20 is the closest time to 22 in the array of events
    );
  });
});
