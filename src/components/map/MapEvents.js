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
      {({
        journeys: areaJourneysResult = [],
        areaSpeeds: areaSpeedsResult = [],
        loading: areaJourneysLoading,
        speedSearch: speedSearchResult = false,
        error: errorMsg = null,
      }) => {
        return (
          <SelectedJourneyEvents>
            {({
              journey: selectedJourney = null,
              loading: selectedJourneyLoading = false,
            }) => (
              <MergedJourneys
                areaJourneys={areaJourneysResult}
                areaSpeeds={areaSpeedsResult}
                selectedJourney={selectedJourney}>
                {({currentJourneys = []}) => {
                  return children({
                    selectedJourney,
                    areaJourneys: areaJourneysResult,
                    areaSpeeds: areaSpeedsResult,
                    speedSearch: speedSearchResult,
                    currentJourneys,
                    areaJourneysLoading,
                    selectedJourneyLoading: selectedJourneyLoading,
                    errorMsg,
                  });
                }}
              </MergedJourneys>
            )}
          </SelectedJourneyEvents>
        );
      }}
    </AreaJourneys>
  );
});

export default MapEvents;
