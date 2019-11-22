import React from "react";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import get from "lodash/get";
import AreaJourneys from "../AreaJourneys";
import SelectedJourneyEvents from "../SelectedJourneyEvents";
import MergedJourneys from "../MergedJourneys";
import UnsignedVehicleEvents from "../UnsignedVehicleEvents";
import {inject} from "../../helpers/inject";

const decorate = flow(
  observer,
  inject("state")
);

const MapEvents = decorate(({children, state}) => {
  const {areaEventsRouteFilter} = state;

  return (
    <AreaJourneys>
      {({journeys: areaJourneysResult = [], loading: areaJourneysLoading}) => {
        let areaJourneys = areaJourneysResult;

        if (areaEventsRouteFilter) {
          const routes = areaEventsRouteFilter.split(",").map((r) => r.trim());
          areaJourneys = areaJourneysResult.filter((route) => {
            if (!get(route, "routeId", null)) {
              return routes.some((r) => r === "signoff");
            }

            return routes.some((r) => route.routeId.includes(r));
          });
        }

        // Temporarily disable this featrue
        const routeJourneys = [];
        const routeEventsLoading = false;

        return (
          /*<RouteJourneys>
            {({routeJourneys, loading: routeEventsLoading = false}) => (*/
          <SelectedJourneyEvents>
            {({
              journey: selectedJourney = null,
              loading: selectedJourneyLoading = false,
            }) => (
              <UnsignedVehicleEvents>
                {({unsignedEvents = [], loading: unsignedEventsLoading = false}) => (
                  <MergedJourneys
                    routeJourneys={routeJourneys}
                    areaJourneys={areaJourneys}
                    selectedJourney={selectedJourney}>
                    {({currentJourneys = [], routeAndSelected = []}) =>
                      children({
                        selectedJourney,
                        routeJourneys,
                        areaJourneys,
                        unsignedEvents,
                        currentJourneys,
                        routeAndSelected,
                        areaJourneysLoading,
                        unsignedEventsLoading,
                        routeEventsLoading,
                        selectedJourneyLoading: selectedJourneyLoading,
                      })
                    }
                  </MergedJourneys>
                )}
              </UnsignedVehicleEvents>
            )}
          </SelectedJourneyEvents>
          /*)}
          </RouteJourneys>*/
        );
      }}
    </AreaJourneys>
  );
});

export default MapEvents;
