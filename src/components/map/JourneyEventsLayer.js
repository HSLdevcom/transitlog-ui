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
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: var(--light-blue);
    position: relative;
    line-height: 1;
    
    span {
      font-size: 11px;
      font-weight: bold;
      text-align: center;
      margin-top: 12px;
      position: absolute;
      top: 5px;
      left: calc(50% - 7.5px);
      margin-left: -3.5px;
    }
  }
  
  .event-icon.offsetIcon {
    span {
      top: 20px;
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
      {Array.from(eventGroups.values()).map((eventGroup) => (
        <JourneyMapEvent key={eventGroup.id} eventGroup={eventGroup} />
      ))}
    </>
  );
});

export default JourneyEventsLayer;
