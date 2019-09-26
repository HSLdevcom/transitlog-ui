import React from "react";
import flow from "lodash/flow";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import RouteStop from "./RouteStop";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";

const decorate = flow(
  observer,
  inject("state")
);

const JourneyStopsLayer = decorate(
  ({
    state: {date, stop: selectedStop, highlightedStop, selectedJourney},
    onViewLocation,
    showRadius,
    journey = null,
  }) => {
    if (journey && journey.events) {
      const stopEvents = journey.events.filter((evt) => {
        const useDEP = evt.isTimingStop || evt.isOrigin;
        return ["ARS", "PLANNED", useDEP ? "DEP" : "PDE"].includes(evt.type);
      });

      const stopGroups = orderBy(
        Object.values(groupBy(stopEvents, "stopId")),
        (events) => events[0].recordedAtUnix,
        "asc"
      );

      return stopGroups.map((events, index, arr) => {
        const isFirst = index === 0;
        const isLast = index === arr.length - 1;

        let useEvent;

        const arrival = events.find((evt) => evt.type === "ARS");

        const useDEP = events.some((evt) => !!(evt.isTimingStop || evt.isOrigin));
        let departure =
          events.find((evt) => evt.type === (useDEP ? "DEP" : "PDE")) || arrival;

        if (!departure) {
          useEvent = events.find((evt) => evt.type === "PLANNED");
          departure = useEvent;

          if (!useEvent) {
            return null;
          }
        } else {
          useEvent = departure;
        }

        const isSelected = useEvent.stopId === selectedStop;
        const isHighlighted = useEvent.stopId === highlightedStop;

        return (
          <RouteStop
            key={`journey_stop_marker_${useEvent.stopId}_${useEvent.index}_${useEvent.id}`}
            selected={isSelected}
            highlighted={isHighlighted}
            firstTerminal={isFirst}
            lastTerminal={isLast}
            selectedJourney={selectedJourney}
            journey={journey}
            firstStop={arr[0][1]}
            stopId={useEvent.stopId}
            stop={useEvent.stop}
            departure={departure}
            arrival={arrival}
            date={date}
            onViewLocation={onViewLocation}
            showRadius={showRadius}
          />
        );
      });
    }

    return null;
  }
);

export default JourneyStopsLayer;
