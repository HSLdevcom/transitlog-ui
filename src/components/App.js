import React, {useMemo} from "react";
import FilterBar from "./filterbar/FilterBar";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import SidePanel from "./sidepanel/SidePanel";
import JourneyPosition from "./JourneyPosition";
import MapContent from "./map/MapContent";
import ErrorMessages from "./ErrorMessages";
import SharingModal from "./SharingModal";
import FeedbackModal from "./FeedbackModal";
import getJourneyId from "../helpers/getJourneyId";
import {inject} from "../helpers/inject";
import flow from "lodash/flow";
import get from "lodash/get";
import {withRoute} from "../hoc/withRoute";
import Graph from "./map/Graph";
import LoginModal from "./LoginModal";
import ServerMessage from "./ServerMessage";
import MapEvents from "./map/MapEvents";
import LeafletMap from "./map/Map";
import {useAuth} from "../auth/useAuth";
import CenterOnPosition from "./map/CenterOnPosition";

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

const decorate = flow(observer, withRoute, inject("UI"));

function App({route, state, UI}) {
  const {
    date,
    selectedJourney,
    live,
    journeyGraphOpen,
    loginModalOpen,
    language,
    journeyDetailsOpen,
  } = state;

  // Receive the auth code and check session
  useAuth(UI.setUser);

  const selectedJourneyId = getJourneyId(selectedJourney);

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
          areaJourneys,
          currentJourneys,
          areaJourneysLoading,
          selectedJourneyLoading,
        }) => (
          <AppGrid>
            <ServerMessage />
            <FilterBar journeys={currentJourneys} />
            <SidepanelAndMapWrapper>
              <JourneyPosition date={date} journeys={currentJourneys}>
                {(currentJourneyPositions) => (
                  <>
                    <CenterOnPosition journeyPositions={currentJourneyPositions} />
                    <SidePanel
                      areaJourneysLoading={!live && areaJourneysLoading}
                      journeyLoading={selectedJourneyLoading}
                      areaEvents={areaJourneys}
                      journey={selectedJourney}
                      route={route}
                      detailsOpen={detailsAreOpen}
                    />
                    <Map detailsOpen={detailsAreOpen}>
                      <MapContent
                        centerOnRoute={areaJourneys.length === 0}
                        journeys={currentJourneys}
                        journeyPositions={currentJourneyPositions}
                        route={route}
                      />
                      {selectedJourney && (
                        <GraphContainer
                          data-testid="journey-graph-container"
                          journeyGraphOpen={
                            get(selectedJourney, "vehiclePositions", []).length !== 0 &&
                            journeyGraphOpen
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
                    </Map>
                  </>
                )}
              </JourneyPosition>
            </SidepanelAndMapWrapper>
          </AppGrid>
        )}
      </MapEvents>
      <ErrorMessages />
      <SharingModal onClose={() => UI.toggleShareModal(false)} />
      <FeedbackModal onClose={() => UI.toggleFeedbackModal(false)} />
    </AppFrame>
  );
}

export default decorate(App);
