import React from "react";
import {observer} from "mobx-react-lite";
import JourneyQuery from "../queries/JourneyQuery";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";
import {createRouteId} from "../helpers/keys";
import EnsureJourneySelection from "../helpers/EnsureJourneySelection";

const decorate = flow(
  observer,
  inject("state")
);

const SelectedJourneyEvents = decorate(({children, state}) => {
  const {selectedJourney, route} = state;

  // Hide fetched selected journey HFP if the route is not selected
  const selectedJourneyValid =
    !!selectedJourney && createRouteId(route) === createRouteId(selectedJourney);

  return (
    <JourneyQuery
      skip={!selectedJourneyValid}
      journey={selectedJourney}
      includeUnsigned={!!state.user}>
      {({journey = null, loading}) => (
        <EnsureJourneySelection journey={journey} loading={loading}>
          {children}
        </EnsureJourneySelection>
      )}
    </JourneyQuery>
  );
});

export default SelectedJourneyEvents;
