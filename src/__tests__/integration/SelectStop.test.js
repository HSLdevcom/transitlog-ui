import React from "react";
import "jest-dom/extend-expect";
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
import {allStopsQuery} from "../../queries/AllStopsQuery";
import mockStopResponse from "../stop_options_response.json";
import mockStopDeparturesResponse from "../stop_departures_response.json";
import mockSingleStopResponse from "../single_stop_response.json";
import StopSettings from "../../components/filterbar/StopSettings";
import get from "lodash/get";
import SidePanel from "../../components/sidepanel/SidePanel";
import {text} from "../../helpers/text";
import {departuresQuery} from "../../queries/DeparturesQuery";
import {singleStopQuery} from "../../queries/SingleStopQuery";

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
];

describe("Stop search and filtering", () => {
  let state = {};
  let setStopMock = jest.fn();

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
  };

  const RenderContext = ({children}) => (
    <MobxProviders
      state={state}
      actions={{
        UI: {},
        Filters: {
          setStop: (stop) => setStopMock(stop),
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
    expect(setStopMock).toHaveBeenCalledWith("1420104");
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
    expect(setStopMock).toHaveBeenCalledWith("1291162");
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

    // const firstDeparture = await findByTestId("virtual-list");
    // expect(firstDeparture).toHaveTextContent("05:38");
  });
});
