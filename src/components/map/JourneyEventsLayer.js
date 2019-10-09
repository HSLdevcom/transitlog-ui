import React, {useMemo} from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import JourneyMapEvent from "./JourneyMapEvent";
import {createGlobalStyle} from "styled-components";
import {latLng} from "leaflet";

const decorate = flow(
  observer,
  inject("state")
);

const IconStyle = createGlobalStyle`
  .event-icon {
    text-indent: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--light-blue);
    line-height: 1;
    position: relative;
    transition: transform 0.2s ease-out;
    
    &:hover {
      transform: scale(1.15);
    }
    
    span {
      font-size: 11px;
      font-weight: bold;
      position: absolute;
      top: 1px;
      left: 16px;
      
      &.left {
        left: auto;
        text-align: right;
        right: 16px;
      }
    }
  }
`;

const JourneyEventsLayer = decorate(({journey = null, state}) => {
  const nonStopEvents = useMemo(() => {
    if (!journey || !journey.events || journey.events.length === 0) {
      return [];
    }

    return journey.events.filter(
      (evt) => evt.__typename !== "JourneyStopEvent" && !!evt.lat && !!evt.lng
    );
  }, [journey]);

  const visibleEvents = nonStopEvents.filter(
    (evt) => !!state.journeyEventFilters[evt.type]
  );

  const eventGroups = visibleEvents.reduce((proximityGroups, event) => {
    const point = latLng([event.lat, event.lng]);
    let currentArea = point.toBounds(5);

    const initialGroup = {
      id: "empty_group",
      positions: [],
      types: [],
      events: [],
    };

    for (const area of proximityGroups.keys()) {
      if (area.contains(point)) {
        currentArea = area;
        break;
      }
    }

    const currentGroup = proximityGroups.get(currentArea) || initialGroup;

    currentGroup.positions.push(point);
    currentGroup.events.push(event);
    currentGroup.id = currentGroup.events
      .map(({id}) => id)
      .sort()
      .join("_");

    proximityGroups.set(currentArea, currentGroup);
    return proximityGroups;
  }, new Map());

  return (
    <>
      <IconStyle />
      {Array.from(eventGroups.values()).map((eventGroup, i) => (
        <JourneyMapEvent
          key={`event_group_${eventGroup.id}`}
          eventGroup={eventGroup}
          rightText={i % 2 === 0}
        />
      ))}
    </>
  );
});

export default JourneyEventsLayer;
