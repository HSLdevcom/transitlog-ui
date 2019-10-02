import React, {useMemo, useEffect} from "react";
import FilterBar from "./filterbar/FilterBar";
import {Observer, observer} from "mobx-react-lite";
import Map from "./map/Map";
import styled from "styled-components";
import SidePanel from "./sidepanel/SidePanel";
import JourneyPosition from "./JourneyPosition";
import MapContent from "./map/MapContent";
import {latLng} from "leaflet";
import SingleStopQuery from "../queries/SingleStopQuery";
import ErrorMessages from "./ErrorMessages";
import SharingModal from "./SharingModal";
import getJourneyId from "../helpers/getJourneyId";
import {inject} from "../helpers/inject";
import flow from "lodash/flow";
import get from "lodash/get";
import {withRoute} from "../hoc/withRoute";
import Graph from "./map/Graph";
import LoginModal from "./LoginModal";
import {checkExistingSession, authorize} from "../auth/authService";
import {removeAuthParams} from "../stores/UrlManager";
import ServerMessage from "./ServerMessage";
import MapEvents from "./map/MapEvents";

const AppFrame = styled.main`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const AppGrid = styled.div`
  width: 100%;
  min-width: 1024px; // No, we are not mobile friendly
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const SidepanelAndMapWrapper = styled.div`
  display: flex;
  width: 100%;
  flex: 1 1 100%;
`;

const MapPanel = styled(Map)`
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
`;

const GraphContainer = styled.div`
  background-color: white;
  border: 1px solid var(--alt-grey);
  height: ${({journeyGraphOpen}) => (journeyGraphOpen ? "170px" : "0px")};
  border: ${({journeyGraphOpen}) =>
    journeyGraphOpen ? "1px solid var(--alt-grey)" : "none"};
  border-radius: 5px;
  position: absolute;
  width: 520px;
  box-sizing: content-box;
  left: 50%;
  bottom: 1.5rem;
  transform: translateX(-50%);
  z-index: 500;
  padding: ${({journeyGraphOpen}) => (journeyGraphOpen ? "0.5rem" : "0")};
`;

const decorate = flow(
  observer,
  withRoute,
  inject("UI")
);

function App({route, state, UI}) {
  const {
    date,
    stop: selectedStopId,
    shareModalOpen,
    selectedJourney,
    journeyDetailsOpen,
    sidePanelVisible,
    live,
    journeyGraphOpen,
    loginModalOpen,
    areaEventsRouteFilter,
    areaEventsBounds,
  } = state;
  const selectedJourneyId = getJourneyId(selectedJourney);
  const code = useMemo(() => new URL(window.location.href).searchParams.get("code"), []);

  useEffect(() => {
    const auth = async () => {
      const response = await checkExistingSession();
      response && response.isOk && response.email
        ? UI.setUser(response.email)
        : UI.setUser(null);

      if (code) {
        const response = await authorize(code);

        if (response && response.isOk && response.email) {
          UI.setUser(response.email);
        }

        removeAuthParams();
      }
    };

    auth();
  }, [code]);

  const detailsAreOpen = useMemo(
    () => journeyDetailsOpen && (selectedJourneyId || route),
    [journeyDetailsOpen, selectedJourneyId, route]
  );

  const sidePanelIsOpen = sidePanelVisible;

  return (
    <AppFrame lang={state.language}>
      {loginModalOpen && <LoginModal />}
      <MapEvents areaEventsRouteFilter={areaEventsRouteFilter}>
        {({
          selectedJourney,
          routeJourneys,
          areaJourneys,
          unsignedEvents,
          currentJourneys,
          routeAndSelected,
          areaJourneysLoading,
          unsignedEventsLoading,
          routeEventsLoading,
          selectedJourneyLoading,
        }) => (
          <AppGrid>
            <ServerMessage />
            <FilterBar
              routeEventsLoading={routeEventsLoading}
              unsignedEventsLoading={unsignedEventsLoading}
              journeys={currentJourneys}
            />
            <SidepanelAndMapWrapper>
              <SingleStopQuery date={date} stopId={selectedStopId}>
                {({stop}) => (
                  <JourneyPosition date={date} journeys={routeAndSelected}>
                    {(currentJourneyPositions) => (
                      <>
                        <SidePanel
                          areaJourneysLoading={!live && areaJourneysLoading}
                          journeyLoading={selectedJourneyLoading}
                          areaEvents={areaJourneys}
                          areaSearchActive={!!areaEventsBounds}
                          journey={selectedJourney}
                          stop={stop}
                          route={route}
                          sidePanelOpen={sidePanelIsOpen}
                          detailsOpen={detailsAreOpen}
                        />
                        <MapPanel
                          detailsOpen={detailsAreOpen}
                          sidePanelOpen={sidePanelIsOpen}>
                          {({zoom, setMapView, getMapView, setViewerLocation}) => (
                            <>
                              <Observer>
                                {() => {
                                  // Set the map center from a selected
                                  // stop position or selected
                                  // selectedJourney position.
                                  if (!live) {
                                    const stopPosition = stop
                                      ? latLng([stop.lat, stop.lng])
                                      : false;

                                    const selectedJourneyPosition =
                                      currentJourneyPositions.size === 1 &&
                                      selectedJourneyId
                                        ? currentJourneyPositions.get(
                                            selectedJourneyId
                                          ) || false
                                        : false;

                                    const {lat, lng} = selectedJourneyPosition || {};

                                    // If a journey is selected, use the
                                    // journey position if available.
                                    // Else use the selected stop
                                    // position if available.
                                    const centerPosition =
                                      lat && lng && selectedJourney
                                        ? latLng([lat, lng])
                                        : !selectedJourney
                                        ? stopPosition
                                        : false;

                                    if (centerPosition) {
                                      setMapView(centerPosition);
                                    }
                                  }

                                  return null;
                                }}
                              </Observer>
                              <MapContent
                                centerOnRoute={areaJourneys.length === 0}
                                setMapView={setMapView}
                                routeJourneys={routeJourneys}
                                journeys={currentJourneys}
                                journeyPositions={currentJourneyPositions}
                                unsignedEvents={unsignedEvents}
                                route={route}
                                stop={stop}
                                zoom={zoom}
                                viewLocation={setViewerLocation}
                                mapBounds={getMapView()}
                              />
                              {selectedJourney && (
                                <GraphContainer
                                  journeyGraphOpen={
                                    get(selectedJourney, "departures", []).length !== 0 &&
                                    journeyGraphOpen
                                  }>
                                  <Graph
                                    width={530}
                                    departures={get(selectedJourney, "departures", [])}
                                    events={get(selectedJourney, "vehiclePositions", [])}
                                    graphExpanded={
                                      get(selectedJourney, "departures", []) !== 0 &&
                                      journeyGraphOpen
                                    }
                                  />
                                </GraphContainer>
                              )}
                            </>
                          )}
                        </MapPanel>
                      </>
                    )}
                  </JourneyPosition>
                )}
              </SingleStopQuery>
            </SidepanelAndMapWrapper>
          </AppGrid>
        )}
      </MapEvents>
      <ErrorMessages />
      <SharingModal isOpen={shareModalOpen} onClose={() => UI.toggleShareModal(false)} />
    </AppFrame>
  );
}

export default decorate(App);
