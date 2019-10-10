import React from "react";
import flow from "lodash/flow";
import RouteStop from "./RouteStop";
import {observer} from "mobx-react-lite";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";
import {inject} from "../../helpers/inject";

const decorate = flow(
  observer,
  inject("UI")
);

const RouteStopsLayer = decorate(
  ({
    UI,
    state: {date, stop: selectedStop, highlightedStop, selectedJourney},
    route,
    showRadius,
  }) => {
    return (
      <StopsByRouteQuery date={date} route={route} skip={!route}>
        {({stops}) => {
          return stops.map((stop, index, arr) => {
            const isFirst = index === 0;
            const isLast = index === arr.length - 1;

            return (
              <RouteStop
                key={`stop_marker_${stop.stopId}_${stop.stopIndex}`}
                firstTerminal={isFirst}
                lastTerminal={isLast}
                selectedJourney={selectedJourney}
                firstStop={arr[0]}
                stopId={stop.stopId}
                stop={stop}
                date={date}
                onViewLocation={UI.setMapillaryViewerLocation}
                showRadius={showRadius}
              />
            );
          });
        }}
      </StopsByRouteQuery>
    );
  }
);

export default RouteStopsLayer;
