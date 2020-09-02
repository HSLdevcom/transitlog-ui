import React from "react";
import FilterBar from "./filterbar/FilterBar";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import JourneyPosition from "./JourneyPosition";
import ErrorMessages from "./ErrorMessages";
import SharingModal from "./SharingModal";
import FeedbackModal from "./FeedbackModal";
import {inject} from "../helpers/inject";
import flow from "lodash/flow";
import {withRoute} from "../hoc/withRoute";
import LoginModal from "./LoginModal";
import ServerMessage from "./ServerMessage";
import MapEvents from "./map/MapEvents";
import {useAuth} from "../auth/useAuth";
import AppContent from "./AppContent";

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

const decorate = flow(observer, withRoute, inject("UI"));

function App({route, state, UI}) {
  const {date, loginModalOpen, language} = state;

  // Receive the auth code and check session
  useAuth(UI.setUser);

  return (
    <AppFrame lang={language}>
      {loginModalOpen && <LoginModal />}
      <MapEvents>
        {({
          selectedJourney: currentJourney,
          areaJourneys,
          currentJourneys: allJourneys,
          areaJourneysLoading,
          selectedJourneyLoading,
        }) => (
          <AppGrid>
            <ServerMessage />
            <FilterBar journeys={allJourneys} />
            <SidepanelAndMapWrapper>
              <JourneyPosition date={date} journeys={allJourneys}>
                {(currentJourneyPositions) => (
                  <AppContent
                    currentJourneyPositions={currentJourneyPositions}
                    areaJourneysLoading={areaJourneysLoading}
                    areaJourneys={areaJourneys}
                    route={route}
                    selectedJourneyLoading={selectedJourneyLoading}
                    currentJourney={currentJourney}
                    allJourneys={allJourneys}
                  />
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
