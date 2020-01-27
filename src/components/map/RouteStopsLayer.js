import React from "react";
import flow from "lodash/flow";
import RouteStop from "./RouteStop";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";

const decorate = flow(observer, inject("state"));

const RouteStopsLayer = decorate(
  ({state: {date, selectedJourney}, routeStops = [], showRadius}) => {
    return routeStops.map((stop, index, arr) => {
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
          showRadius={showRadius}
        />
      );
    });
  }
);

export default RouteStopsLayer;
