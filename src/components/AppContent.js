import React, {useMemo, useEffect} from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import SidePanel from "./sidepanel/SidePanel";
import MapContent from "./map/MapContent";
import get from "lodash/get";
import Graph from "./map/Graph";
import styled from "styled-components";
import LeafletMap from "./map/Map";
import getJourneyId from "../helpers/getJourneyId";
import {inject} from "../helpers/inject";
import {latLng} from "leaflet";

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

const decorate = flow(observer, inject("UI"));

let AppContent = decorate(
  ({
    state,
    UI,
    currentJourneyPositions,
    areaJourneysLoading,
    areaJourneys,
    route,
    selectedJourneyLoading,
    currentJourney,
    allJourneys,
  }) => {
    let {
      live,
      journeyGraphOpen,
      selectedJourney,
      journeyDetailsOpen,
      currentMapillaryMapLocation,
    } = state;

    const selectedJourneyId = getJourneyId(selectedJourney);

    // Condition for when the side panel is actually open, not only when it could be open.
    const detailsAreOpen = useMemo(
      () => journeyDetailsOpen && (!!selectedJourneyId || (!!route && !!route.routeId)),
      [journeyDetailsOpen, selectedJourneyId, route]
    );

    // Center the map on the current journey.
    useEffect(() => {
      if (live) {
        return;
      }

      const selectedJourneyPosition =
        currentJourneyPositions.size === 1 && selectedJourneyId
          ? currentJourneyPositions.get(selectedJourneyId) || false
          : false;

      const {lat, lng} = selectedJourneyPosition || {};

      let centerPosition = false;

      if (currentMapillaryMapLocation) {
        centerPosition = currentMapillaryMapLocation;
      } else if (lat && lng && selectedJourney) {
        centerPosition = latLng([lat, lng]);
      }

      if (centerPosition) {
        UI.setMapView(centerPosition);
      }
    }, [live, currentJourneyPositions, currentMapillaryMapLocation]);

    return (
      <>
        <SidePanel
          areaJourneysLoading={!live && areaJourneysLoading}
          journeyLoading={selectedJourneyLoading}
          areaEvents={areaJourneys}
          journey={currentJourney}
          route={route}
          detailsOpen={detailsAreOpen}
        />
        <Map detailsOpen={detailsAreOpen}>
          <MapContent
            centerOnRoute={areaJourneys.length === 0}
            journeys={allJourneys}
            journeyPositions={currentJourneyPositions}
            route={route}
          />
          {currentJourney && (
            <GraphContainer
              data-testid="journey-graph-container"
              journeyGraphOpen={
                get(currentJourney, "vehiclePositions", []).length !== 0 &&
                journeyGraphOpen
              }>
              <Graph
                width={530}
                events={get(currentJourney, "events", [])}
                vehiclePositions={get(currentJourney, "vehiclePositions", [])}
                graphExpanded={
                  get(currentJourney, "departures", []) !== 0 && journeyGraphOpen
                }
              />
            </GraphContainer>
          )}
        </Map>
      </>
    );
  }
);

export default AppContent;
