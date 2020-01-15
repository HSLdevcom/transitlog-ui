import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import {
  render,
  cleanup,
  fireEvent,
  getByText as getByTextUtil,
} from "@testing-library/react";
import RouteDepartures from "../../components/sidepanel/RouteDepartures";
import {MockedProvider} from "@apollo/react-testing";
import {routeJourneysQuery} from "../../queries/RouteDeparturesQuery";
import mockJourneysResponse from "../route_journeys_response";
import mockRouteOptionsResponse from "../route_options_response";
import {MobxProviders} from "../util/MobxProviders";
import {observable, action} from "mobx";
import SidePanel from "../../components/sidepanel/SidePanel";
import {text} from "../../helpers/text";
import {routeOptionsQuery} from "../../queries/RouteOptionsQuery";
import RouteSettings from "../../components/filterbar/RouteSettings";
import {intval} from "../../helpers/isWithinRange";

const date = "2019-05-27";

const routeDepartureMocks = [
  {
    request: {
      query: routeJourneysQuery,
      variables: {
        routeId: "1001",
        direction: 2,
        stopId: "1304130",
        date,
      },
    },
    result: mockJourneysResponse,
  },
  {
    request: {
      query: routeOptionsQuery,
      variables: {
        date: "2019-05-27",
      },
    },
    result: mockRouteOptionsResponse,
  },
];

describe("Route selection and filtering", () => {
  let state = {};
  let setRouteMock = jest.fn();

  const createState = () => {
    state = observable({
      language: "fi",
      live: false,
      date,
      sidePanelVisible: true,
      route: {routeId: "", direction: "", originStopId: ""},
    });

    setRouteMock = jest.fn(
      action((route) => {
        const {routeId = "", direction = "", originStopId = ""} = route || {};
        state.route.routeId = routeId;
        state.route.direction = intval(direction);
        state.route.originStopId = originStopId;
      })
    );
  };

  const RenderContext = ({children}) => (
    <MobxProviders state={state} actions={{UI: {}, Filters: {setRoute: setRouteMock}}}>
      <MockedProvider addTypename={true} mocks={routeDepartureMocks}>
        {children}
      </MockedProvider>
    </MobxProviders>
  );

  const renderRouteSettings = () =>
    render(
      <RenderContext>
        <RouteSettings />
      </RenderContext>
    );

  const renderJourneys = () =>
    render(
      <RenderContext>
        <>
          <RouteSettings />
          <RouteDepartures />
        </>
      </RenderContext>
    );

  const renderSidebar = () =>
    render(
      <RenderContext>
        <>
          <RouteSettings />
          <SidePanel detailsOpen={true} sidePanelOpen={true} />
        </>
      </RenderContext>
    );

  beforeEach(createState);
  afterEach(cleanup);

  test("Renders a list of route suggestions when input is focused", async () => {
    const {findByTestId, findAllByText} = renderRouteSettings();
    const routeInput = await findByTestId("route-input");

    // Trigger the autosuggest options
    fireEvent.focus(routeInput);

    // The name of the first route in the mock data
    const firstRouteOption = await findAllByText("1001");
    expect(firstRouteOption[0]).toBeInTheDocument();
  });

  test("Route is selected when the suggestion is clicked.", async () => {
    const {findByTestId, findByText} = renderRouteSettings();
    const routeInput = await findByTestId("route-input");

    // Trigger the autosuggest options
    fireEvent.focus(routeInput);

    const name = "Eira - Käpylä";
    // The name of the first route in the mock data
    const firstRouteOption = await findByText(name);

    fireEvent.click(firstRouteOption);

    expect(setRouteMock).toHaveBeenCalled();
    expect(state.route.routeId).toBe("1001");
    expect(state.route.direction).toBe(1);

    const selectedRouteDisplay = await findByTestId("selected-route-display");
    expect(selectedRouteDisplay).toHaveTextContent(/^1001/g);
    expect(selectedRouteDisplay).toHaveTextContent(name);
  });

  test("The correct route is suggested when searching", async () => {
    const {findByTestId} = renderRouteSettings();
    const routeInput = await findByTestId("route-input");

    // Trigger the autosuggest options and search by route ID
    fireEvent.focus(routeInput);
    fireEvent.change(routeInput, {target: {value: "1001"}});

    // Check that the name of the first suggestion matches the search term
    const suggestions = await findByTestId("route-suggestions-list");
    expect(suggestions.firstChild).toHaveTextContent(/^1001 suunta 1/);

    // Clear and ensure that the list is unfiltered
    fireEvent.change(routeInput, {target: {value: ""}});
    expect(suggestions.firstChild).toHaveTextContent(/^unsigned/);

    fireEvent.change(routeInput, {target: {value: "1018/2"}});

    // Finally select the suggestion
    fireEvent.click(getByTextUtil(suggestions.firstChild, "1018"));
    expect(setRouteMock).toHaveBeenCalled();
    expect(state.route.routeId).toBe("1018");
    expect(state.route.direction).toBe(2);
  });

  test.skip("Fetches and renders a list of the route's departures", async () => {
    const {findByTestId} = renderJourneys();
    const routeInput = await findByTestId("route-input");

    fireEvent.focus(routeInput);
    fireEvent.change(routeInput, {target: {value: "1018/2"}});

    const suggestions = await findByTestId("route-suggestions-list");
    fireEvent.click(getByTextUtil(suggestions.firstChild, "1018"));
    expect(setRouteMock).toHaveBeenCalled();

    // Wait for the list to render
    const firstDepartureRow = await findByTestId("journey-list-row-05:28:00");
    const lastDepartureRow = await findByTestId("journey-list-row-22:26:00");

    // The following assertions are based on the mock response
    expect(firstDepartureRow).toBeInTheDocument();
    expect(firstDepartureRow).toHaveTextContent("05:28"); // The planned departure time
    expect(firstDepartureRow).toHaveTextContent("05:28:26"); // The observed departure time
    expect(firstDepartureRow).toHaveTextContent("00:26"); // The observed difference
    expect(firstDepartureRow).toHaveTextContent("H0"); // The special dayType

    expect(lastDepartureRow).toBeInTheDocument();
    expect(lastDepartureRow).toHaveTextContent("Ei tietoja"); // Finnish is set as the language in the state.
    expect(lastDepartureRow).toHaveTextContent("22:26");
    expect(lastDepartureRow).toHaveTextContent("H0");
  });

  test.skip("Shows information in the sidebar", async () => {
    const {findByTestId} = renderSidebar();
    const routeInput = await findByTestId("route-input");

    fireEvent.focus(routeInput);
    fireEvent.change(routeInput, {target: {value: "1018/2"}});

    const suggestions = await findByTestId("route-suggestions-list");
    fireEvent.click(getByTextUtil(suggestions.firstChild, "1018"));
    expect(setRouteMock).toHaveBeenCalled();

    const sidepanel = await findByTestId("sidepanel");
    expect(sidepanel).toBeInTheDocument();
    expect(sidepanel).toHaveTextContent(text("sidepanel.tabs.journeys", "fi"));
    expect(sidepanel).toHaveTextContent(text("sidepanel.tabs.week_journeys", "fi"));
    expect(sidepanel).toHaveTextContent(text("domain.alerts", "fi"));

    const details = await findByTestId("journey-details");
    expect(details).toBeInTheDocument();
    expect(details).toHaveTextContent("1018");
  });
});
