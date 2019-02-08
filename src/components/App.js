import React, {Component} from "react";
import FilterBar from "./filterbar/FilterBar";
import {app} from "mobx-app";
import {inject, observer, Observer} from "mobx-react";
import Map from "./map/Map";
import styled from "styled-components";
import SidePanel from "./sidepanel/SidePanel";
import JourneyPosition from "./JourneyPosition";
import MapContent from "./map/MapContent";
import {latLng} from "leaflet";
import SingleStopQuery from "../queries/SingleStopQuery";
import AreaHfpEvents from "./AreaHfpEvents";
import ErrorMessages from "./ErrorMessages";
import SharingModal from "./SharingModal";
import SelectedJourneyEvents from "./SelectedJourneyEvents";
import getJourneyId from "../helpers/getJourneyId";

const AppFrame = styled.main`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const AppGrid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 9rem 1fr auto;
  align-content: stretch;
  align-items: stretch;
`;

const SidepanelAndMapWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const MapPanel = styled(Map)`
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
`;

@inject(app("Journey", "Filters", "UI"))
@observer
class App extends Component {
  render() {
    const {state, UI} = this.props;
    const {
      date,
      stop: selectedStopId,
      route,
      shareModalOpen,
      selectedJourney,
      live,
    } = state;

    const hasRoute = !!route && !!route.routeId;

    const selectedJourneyId = getJourneyId(selectedJourney);

    return (
      <AppFrame>
        <AreaHfpEvents date={date} skip={hasRoute}>
          {({
            queryBounds,
            events: areaEvents = [],
            loading: areaEventsLoading,
            timeRange,
          }) => (
            <SelectedJourneyEvents>
              {({
                events: selectedJourneyEvents = [],
                loading: journeyEventsLoading,
              }) => {
                const journeyEvents = selectedJourneyEvents || [];
                let areaHfp = !hasRoute && areaEvents.length !== 0 ? areaEvents : [];

                // The currently fetched positions, either area hfp or selected journey hfp.
                const currentPositions =
                  areaHfp.length !== 0 ? areaHfp : journeyEvents;

                return (
                  <AppGrid>
                    <FilterBar
                      timeRange={timeRange}
                      areaEvents={areaHfp}
                      selectedJourneyEvents={journeyEvents}
                    />
                    <SidepanelAndMapWrapper>
                      <SingleStopQuery date={date} stop={selectedStopId}>
                        {({stop}) => (
                          <>
                            <SidePanel
                              areaEventsLoading={areaEventsLoading}
                              journeyEventsLoading={journeyEventsLoading}
                              areaEvents={areaHfp}
                              selectedJourneyEvents={selectedJourneyEvents}
                              route={route}
                              stop={stop}
                            />
                            <MapPanel>
                              {({
                                zoom,
                                setMapBounds,
                                setMapCenter,
                                setViewerLocation,
                                mapView,
                              }) => (
                                <JourneyPosition
                                  date={date}
                                  positions={currentPositions}>
                                  {(currentTimePositions) => (
                                    <>
                                      <Observer>
                                        {() => {
                                          // Set the map center from here. We don't want to wrap the map
                                          // in these frequently updating components.

                                          if (live) {
                                            return null;
                                          }

                                          const stopPosition = stop
                                            ? latLng([stop.lat, stop.lon])
                                            : false;

                                          const selectedJourneyPosition = selectedJourney
                                            ? currentTimePositions.get(
                                                selectedJourneyId
                                              )
                                            : false;

                                          const centerPosition = selectedJourneyPosition
                                            ? latLng([
                                                selectedJourneyPosition.lat,
                                                selectedJourneyPosition.long,
                                              ])
                                            : stopPosition;

                                          setMapCenter(centerPosition);
                                          return null;
                                        }}
                                      </Observer>
                                      <MapContent
                                        queryBounds={queryBounds}
                                        setMapBounds={setMapBounds}
                                        journeys={currentPositions}
                                        timePositions={currentTimePositions}
                                        route={route}
                                        stop={stop}
                                        zoom={zoom}
                                        viewLocation={setViewerLocation}
                                        stopsBbox={mapView}
                                      />
                                    </>
                                  )}
                                </JourneyPosition>
                              )}
                            </MapPanel>
                          </>
                        )}
                      </SingleStopQuery>
                    </SidepanelAndMapWrapper>
                  </AppGrid>
                );
              }}
            </SelectedJourneyEvents>
          )}
        </AreaHfpEvents>
        <ErrorMessages />
        <SharingModal
          isOpen={shareModalOpen}
          onClose={() => UI.toggleShareModal(false)}
        />
      </AppFrame>
    );
  }
}

export default App;
