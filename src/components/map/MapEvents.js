import React from "react";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import AreaJourneys from "../AreaJourneys";
import SelectedJourneyEvents from "../SelectedJourneyEvents";
import MergedJourneys from "../MergedJourneys";

const decorate = flow(observer);

const MapEvents = decorate(({children}) => {
  return (
    <AreaJourneys>
      {({journeys: areaJourneysResult = [], loading: areaJourneysLoading}) => {
        return (
          <SelectedJourneyEvents>
            {({
              journey: selectedJourney = null,
              loading: selectedJourneyLoading = false,
            }) => (
              <MergedJourneys
                areaJourneys={areaJourneysResult}
                selectedJourney={selectedJourney}>
                {({currentJourneys = []}) =>
                  children({
                    selectedJourney,
                    areaJourneys: areaJourneysResult,
                    currentJourneys,
                    areaJourneysLoading,
                    selectedJourneyLoading: selectedJourneyLoading,
                  })
                }
              </MergedJourneys>
            )}
          </SelectedJourneyEvents>
        );
      }}
    </AreaJourneys>
  );
});

export default MapEvents;
