import React from "react";
import {observer} from "mobx-react-lite";
import Journeys from "./Journeys";
import styled from "styled-components";
import Tabs from "../Tabs";
import TimetablePanel from "./TimetablePanel";
import VehicleJourneys from "./VehicleJourneys";
import {text} from "../../helpers/text";
import AreaJourneyList from "./AreaJourneyList";
import JourneyPanel from "../journeypanel/JourneyPanel";
import Info from "../../icons/Info";
import Chart from "../../icons/Chart";
import {createRouteId} from "../../helpers/keys";
import Timetable from "../../icons/Timetable";
import {UsageInstructions} from "./UsageInstructions";
import Tooltip from "../Tooltip";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import JourneysByWeek from "./JourneysByWeek";
import getWeek from "date-fns/getISOWeek";
import getJourneyId from "../../helpers/getJourneyId";
import Alerts from "./Alerts";
import {legacyParse} from "@date-fns/upgrade/v2";

const SidePanelContainer = styled.div`
  background: var(--lightest-grey);
  color: var(--dark-grey);
  height: 100%;
  position: relative;
  z-index: 1;
  display: flex;
  margin-left: ${({visible}) =>
    visible ? 0 : "-22rem"}; // Makes the map area larger when the sidebar is hidden
  transition: margin-left 0.2s ease-out;
`;

const ToggleSidePanelButton = styled.button`
  background: var(--blue);
  border: 0;
  outline: 0;
  width: 1.5rem;
  height: 3rem;
  position: absolute;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  right: -1.5rem;
  top: 50%;
  padding: 0 0.1rem 0;
  transform: translateY(calc(-100% - 0.5rem));
  color: white;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s ease-out;

  &:hover {
    transform: scale(1.075) translateY(calc(-90% - 0.5rem));
  }
`;

const ToggleJourneyDetailsButton = styled(ToggleSidePanelButton)`
  transform: translateY(0);
  padding: 0 0.1rem 0 0;

  svg {
    transform: none;
  }

  &:hover {
    transform: scale(1.075) translateY(0);
  }
`;

const ToggleGraphButton = styled(ToggleSidePanelButton)`
  transform: translateY(3.5rem);
  padding: 0 0.1rem 0 0;

  svg {
    transform: none;
  }

  &:hover {
    transform: scale(1.075) translateY(3.3rem);
  }
`;

const MainSidePanel = styled.div`
  height: 100%;
  border-right: 1px solid var(--alt-grey);
  width: 22rem;
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-rows: 1fr;
  flex-direction: column;
`;

const JourneyPanelWrapper = styled.div`
  position: relative;
  z-index: 5;
  transition: margin-left 0.2s ease-out;
  margin-left: ${({visible}) =>
    visible ? 0 : "-22rem"}; // Makes the map area larger when the sidebar is hidden
  width: 22rem;
  height: 100%;
  background: white;
  border-right: 1px solid var(--alt-grey);
`;

const decorate = flow(
  observer,
  inject("UI")
);

const SidePanel = decorate((props) => {
  const {
    UI: {toggleSidePanel, toggleJourneyDetails, toggleJourneyGraph},
    areaEvents = [],
    journey = null,
    journeyLoading = false,
    areaJourneysLoading = false,
    stop,
    route,
    detailsOpen,
    state: {
      language,
      date,
      vehicle,
      stop: stateStop,
      route: stateRoute,
      selectedJourney,
      sidePanelVisible,
      showInstructions = false,
      selectedBounds,
      user,
    },
  } = props;

  const areaSearchActive = !!selectedBounds;

  const hasRoute = (stateRoute && stateRoute.routeId) || (route && route.routeId);
  // Figure out which tab is suggested. It will not be outright selected, but
  // if it appears and nothing else is selected then it will be.
  let suggestedTab = "";

  if (areaSearchActive) suggestedTab = "area-journeys";
  if (hasRoute) suggestedTab = "journeys";
  if (user && vehicle) suggestedTab = "vehicle-journeys";
  if (selectedJourney) suggestedTab = "journeys";
  if (stateStop) suggestedTab = "timetables";

  const allTabsHidden = !hasRoute && !areaSearchActive && !vehicle && !stateStop;

  const detailsCanOpen = getJourneyId(selectedJourney) || route;

  return (
    <SidePanelContainer data-testid="sidepanel" visible={sidePanelVisible}>
      <MainSidePanel>
        {showInstructions ? (
          <UsageInstructions language={language} />
        ) : allTabsHidden ? (
          <Alerts language={language} />
        ) : (
          <Tabs urlValue="tab" suggestedTab={suggestedTab}>
            {areaSearchActive && (
              <AreaJourneyList
                helpText="Area search tab"
                loading={areaJourneysLoading}
                journeys={Array.isArray(areaEvents) ? areaEvents : []}
                name="area-journeys"
                label={text("sidepanel.tabs.area_events")}
              />
            )}
            {hasRoute && (
              <Journeys
                helpText="Journeys tab"
                key={`route_journeys_${createRouteId(route, true)}_${date}`}
                route={route}
                loading={journeyLoading}
                name="journeys"
                label={text("sidepanel.tabs.journeys")}
              />
            )}
            {hasRoute && (
              <JourneysByWeek
                helpText="Weekly journeys tab"
                key={`route_journeys_week_${createRouteId(route, true)}_${getWeek(
                  legacyParse(date)
                )}`}
                route={route}
                name="journeys_by_week"
                label={text("sidepanel.tabs.week_journeys")}
              />
            )}
            {user && vehicle && (
              <VehicleJourneys
                helpText="Vehicle journeys tab"
                name="vehicle-journeys"
                label={text("sidepanel.tabs.vehicle_journeys")}
              />
            )}
            {stateStop && (
              <TimetablePanel
                helpText="Timetable tab"
                stop={stop}
                name="timetables"
                label={text("sidepanel.tabs.timetables")}
              />
            )}
            <Alerts helpText="All alerts" name="alerts" label={text("domain.alerts")} />
          </Tabs>
        )}
      </MainSidePanel>
      <JourneyPanelWrapper visible={detailsOpen}>
        {/* The content of the sidebar is independent from the sidebar wrapper so that we can animate it. */}
        {detailsOpen && (
          <JourneyPanel
            loading={journeyLoading}
            journey={journey}
            route={route || stateRoute}
          />
        )}
        <div>
          {detailsCanOpen && (
            <Tooltip helpText="Toggle journey details button">
              <ToggleJourneyDetailsButton onClick={() => toggleJourneyDetails()}>
                <Info fill="white" height="1rem" width="1rem" />
              </ToggleJourneyDetailsButton>
            </Tooltip>
          )}
          {!!journey && (
            <Tooltip helpText="Toggle journey graph button">
              <ToggleGraphButton
                data-testid="toggle-graph-button"
                onClick={() => toggleJourneyGraph()}>
                <Chart fill="white" height="1rem" width="1rem" />
              </ToggleGraphButton>
            </Tooltip>
          )}
        </div>
      </JourneyPanelWrapper>
      <Tooltip helpText="Toggle sidebar button">
        <ToggleSidePanelButton
          isVisible={sidePanelVisible}
          onClick={() => toggleSidePanel()}>
          <Timetable fill="white" height="1.2rem" width="1rem" />
        </ToggleSidePanelButton>
      </Tooltip>
    </SidePanelContainer>
  );
});

export default SidePanel;
