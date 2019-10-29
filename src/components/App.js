import React, {useMemo, useEffect} from "react";
import FilterBar from "./filterbar/FilterBar";
import {Observer, observer} from "mobx-react-lite";
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
import LeafletMap from "./map/Map";

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

const Map = styled(LeafletMap)`
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
    selectedJourney,
    live,
    journeyGraphOpen,
    loginModalOpen,
    language,
    journeyDetailsOpen,
  } = state;

  const selectedJourneyId = getJourneyId(selectedJourney);
  const {code, is_test = "false"} = useMemo(
    () =>
      Array.from(new URL(window.location.href).searchParams.entries()).reduce(
        (params, [key, value]) => {
          params[key] = value;
          return params;
        },
        {}
      ),
    []
  );

  console.log(code, is_test);

  useEffect(() => {
    const auth = async () => {
      const response = await checkExistingSession();
      response && response.isOk && response.email
        ? UI.setUser(response.email)
        : UI.setUser(null);

      if (code) {
        const response = await authorize(code, is_test === "true");

        if (response && response.isOk && response.email) {
          UI.setUser(response.email);
        } else {
          console.error("Login not successful.");
        }

        removeAuthParams();
      }
    };

    auth();
  }, [code]);

  // Condition for when the side panel is actually open, not only when it could be open.
  const detailsAreOpen = useMemo(
    () => journeyDetailsOpen && (!!selectedJourneyId || (!!route && !!route.routeId)),
    [journeyDetailsOpen, selectedJourneyId, route]
  );

  return (
    <AppFrame lang={language}>
      {loginModalOpen && <LoginModal />}
      <MapEvents>
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
                          journey={selectedJourney}
                          stop={stop}
                          route={route}
                          detailsOpen={detailsAreOpen}
                        />
                        <Map detailsOpen={detailsAreOpen}>
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
                                      ? currentJourneyPositions.get(selectedJourneyId) ||
                                        false
                                      : false;

                                  const {lat, lng} = selectedJourneyPosition || {};

                                  // If a journey is selected, use the
                                  // journey position if available.
                                  // Else use the selected stop
                                  // position if available.
                                  let centerPosition = false;

                                  if (state.currentMapillaryMapLocation) {
                                    centerPosition = state.currentMapillaryMapLocation;
                                  } else if (lat && lng && selectedJourney) {
                                    centerPosition = latLng([lat, lng]);
                                  } else if (!selectedJourney) {
                                    centerPosition = stopPosition;
                                  }

                                  if (centerPosition) {
                                    UI.setMapView(centerPosition);
                                  }
                                }

                                return null;
                              }}
                            </Observer>
                            <MapContent
                              centerOnRoute={areaJourneys.length === 0}
                              routeJourneys={routeJourneys}
                              journeys={currentJourneys}
                              journeyPositions={currentJourneyPositions}
                              unsignedEvents={unsignedEvents}
                              route={route}
                              stop={stop}
                            />
                            {selectedJourney && (
                              <GraphContainer
                                journeyGraphOpen={
                                  get(selectedJourney, "vehiclePositions", []).length !==
                                    0 && journeyGraphOpen
                                }>
                                <Graph
                                  width={530}
                                  events={get(selectedJourney, "events", [])}
                                  vehiclePositions={get(
                                    selectedJourney,
                                    "vehiclePositions",
                                    []
                                  )}
                                  graphExpanded={
                                    get(selectedJourney, "departures", []) !== 0 &&
                                    journeyGraphOpen
                                  }
                                />
                              </GraphContainer>
                            )}
                          </>
                        </Map>
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
      <SharingModal onClose={() => UI.toggleShareModal(false)} />
    </AppFrame>
  );
}

export default decorate(App);
