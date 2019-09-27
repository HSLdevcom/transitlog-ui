import React from "react";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import AreaJourneys from "../AreaJourneys";
import SelectedJourneyEvents from "../SelectedJourneyEvents";
import MergedJourneys from "../MergedJourneys";
import RouteJourneys from "../RouteJourneys";
import UnsignedVehicleEvents from "../UnsignedVehicleEvents";

const decorate = flow(observer);

const MapEvents = decorate(({areaEventsRouteFilter, children}) => {
  return (
    <AreaJourneys>
      {({
        setQueryBounds,
        actualQueryBounds,
        journeys: areaJourneysResult = [],
        loading: areaJourneysLoading,
      }) => {
        let areaJourneys = areaJourneysResult;

        if (areaEventsRouteFilter) {
          const routes = areaEventsRouteFilter.split(",").map((r) => r.trim());
          areaJourneys = areaJourneysResult.filter(({routeId}) =>
            routes.some((r) => routeId.includes(r))
          );
        }

        return (
          <RouteJourneys>
            {({routeJourneys}) => (
              <SelectedJourneyEvents>
                {({journey: selectedJourney = null, loading: selectedJourneyLoading}) => (
                  <UnsignedVehicleEvents>
                    {({unsignedEvents = [], loading: unsignedEventsLoading}) => (
                      <MergedJourneys
                        routeJourneys={routeJourneys}
                        areaJourneys={areaJourneys}
                        selectedJourney={selectedJourney}>
                        {({currentJourneys = [], routeAndSelected = []}) =>
                          children({
                            routeJourneys,
                            areaJourneys,
                            unsignedEvents,
                            currentJourneys,
                            routeAndSelected,
                            areaJourneysLoading,
                            unsignedEventsLoading,
                            selectedJourneyLoading: selectedJourneyLoading,
                            setAreaQueryBounds: setQueryBounds,
                            actualAreaQueryBounds: actualQueryBounds,
                          })
                        }
                      </MergedJourneys>
                    )}
                  </UnsignedVehicleEvents>
                )}
              </SelectedJourneyEvents>
            )}
          </RouteJourneys>
        );
      }}
    </AreaJourneys>
  );
});

export default MapEvents;
