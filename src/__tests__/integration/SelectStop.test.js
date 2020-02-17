import React from "react";
import "@testing-library/jest-dom/extend-expect";
import "jest-styled-components";
import {
  render,
  cleanup,
  fireEvent,
  getByText as getByTextUtil,
} from "@testing-library/react";
import {observable, action} from "mobx";
import {MobxProviders} from "../util/MobxProviders";
import {MockedProvider} from "@apollo/react-testing";
import mockStopResponse from "../stop_options_response.json";
import mockStopDeparturesResponse from "../stop_departures_response.json";
import mockSingleStopResponse from "../single_stop_response.json";
import StopSettings from "../../components/filterbar/StopSettings";
import get from "lodash/get";
import SidePanel from "../../components/sidepanel/SidePanel";
import {text} from "../../helpers/text";
import {allStopsQuery, singleStopQuery} from "../../components/map/StopLayer";
import {terminalsQuery} from "../../components/map/TerminalLayer";
import {departuresQuery} from "../../components/sidepanel/StopDepartures";

const date = "2019-05-27";

const stopRequestMocks = [
  {
    request: {
      query: departuresQuery,
      variables: {
        date,
        stopId: "1420104",
      },
    },
    result: mockStopDeparturesResponse,
  },
  {
    request: {
      query: singleStopQuery,
      variables: {
        date,
        stopId: "1420104",
      },
    },
    result: mockSingleStopResponse,
  },
  {
    request: {
      query: allStopsQuery,
      variables: {
        date,
      },
    },
    result: mockStopResponse,
  },
  {
    request: {
      query: terminalsQuery,
      variables: {
        date,
      },
    },
    result: {
      data: {
        terminals: [
          {
            id: "1000001",
            name: "Kamppi (lähiliikenneterminaali)",
            lat: 60.169002,
            lng: 24.93166,
            modes: ["BUS"],
            stopIds: [
              "1040271",
              "1040272",
              "1040273",
              "1040274",
              "1040275",
              "1040276",
              "1040277",
              "1040278",
              "1040279",
            ],
            __typename: "Terminal",
          },
          {
            id: "1000002",
            name: "Elielinaukio",
            lat: 60.171802,
            lng: 24.93948,
            modes: ["BUS"],
            stopIds: [
              "1020228",
              "1020245",
              "1020239",
              "1020241",
              "1020243",
              "1020128",
              "1020129",
              "1020131",
              "1020132",
            ],
            __typename: "Terminal",
          },
        ],
      },
    },
  },
];

describe("Stop search and filtering", () => {
  let state = {};
  let setStopMock = jest.fn();
  let setTerminalMock = jest.fn();

  const createState = () => {
    state = observable({
      language: "fi",
      live: false,
      date,
      stop: "",
      route: {},
    });

    setStopMock = jest.fn(
      action((stop) => {
        state.stop = get(stop, "stopId", stop);
      })
    );

    setTerminalMock = jest.fn(
      action((terminal) => {
        state.terminal = get(terminal, "id", terminal);
      })
    );
  };

  const RenderContext = ({children}) => (
    <MobxProviders
      state={state}
      actions={{
        UI: {},
        Filters: {
          setStop: (stop) => setStopMock(stop),
          setTerminal: (terminal) => setTerminalMock(terminal),
        },
      }}>
      <MockedProvider addTypename={true} mocks={stopRequestMocks}>
        {children}
      </MockedProvider>
    </MobxProviders>
  );

  const renderStopSettings = () =>
    render(
      <RenderContext>
        <StopSettings />
      </RenderContext>
    );

  const renderWithSidebar = () =>
    render(
      <RenderContext>
        <>
          <StopSettings />
          <SidePanel />
        </>
      </RenderContext>
    );

  beforeEach(createState);
  afterEach(cleanup);

  test("Renders a list of stop suggestions when input is focused", async () => {
    const {findByTestId, findByText} = renderStopSettings();
    const stopInput = await findByTestId("stop-input");

    // Trigger the autosuggest options
    fireEvent.focus(stopInput);

    // The name of the first stop in the mock data
    const firstStopOption = await findByText("Marsalkantie");
    expect(firstStopOption).toBeInTheDocument();
  });

  test("Stop is selected when the suggestion is clicked.", async () => {
    const {findByTestId, findByText} = renderStopSettings();
    const stopInput = await findByTestId("stop-input");

    // Trigger the autosuggest options
    fireEvent.focus(stopInput);

    // The name of the first stop in the mock data
    const firstStopOption = await findByText("Marsalkantie");

    fireEvent.click(firstStopOption);
    expect(setStopMock).toHaveBeenCalledWith(expect.objectContaining({id: "1420104"}));
    expect(state.stop).toBe("1420104");

    const selectedStopDisplay = await findByTestId("selected-stop-display");
    expect(selectedStopDisplay).toHaveTextContent(/^1420104/g);
    expect(selectedStopDisplay).toHaveTextContent(/Marsalkantie$/g);
  });

  test("The correct stop is suggested when searching", async () => {
    const {findByTestId} = renderStopSettings();
    const stopInput = await findByTestId("stop-input");

    // Trigger the autosuggest options and do a search by the short ID
    fireEvent.focus(stopInput);
    fireEvent.change(stopInput, {target: {value: "1728"}});

    // Check that the name of the first suggestion matches the search term
    const suggestions = await findByTestId("stop-suggestions-list");
    expect(suggestions.firstChild).toHaveTextContent("Matkamiehentie");

    // Clear and ensure that the list is unfiltered
    fireEvent.change(stopInput, {target: {value: ""}});
    expect(suggestions.firstChild).toHaveTextContent("Marsalkantie");

    // Then search again by the name of the stop.
    fireEvent.change(stopInput, {target: {value: "Matkamie"}});
    expect(suggestions.firstChild).toHaveTextContent("Matkamiehentie");

    // Finally select the suggestion
    fireEvent.click(getByTextUtil(suggestions.firstChild, "Matkamiehentie"));
    expect(setStopMock).toHaveBeenCalledWith(expect.objectContaining({id: "1291162"}));
    expect(state.stop).toBe("1291162");
  });

  test("The stop timetables are shown in the sidepanel when a stop is selected.", async () => {
    jest.setTimeout(100000);
    const {findByTestId, findByText, getByText} = renderWithSidebar();
    const stopInput = await findByTestId("stop-input");

    // Trigger the autosuggest options
    fireEvent.focus(stopInput);

    // The name of the first stop in the mock data
    const firstStopOption = await findByText("Marsalkantie");
    fireEvent.click(firstStopOption);
    expect(state.stop).toBe("1420104");

    const sidepanel = await findByTestId("sidepanel");
    expect(sidepanel).toHaveTextContent(text("sidepanel.tabs.timetables", "fi"));

    fireEvent.click(getByText(text("sidepanel.tabs.timetables", "fi")));

    const departuresList = await findByTestId("stop-departures-list");
    expect(departuresList).toBeTruthy();
  });
});
