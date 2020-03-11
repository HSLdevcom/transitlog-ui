import React, {useMemo} from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import JourneyMapEvent from "./JourneyMapEvent";
import JourneyMapEventTlp from "./JourneyMapEventTlp";
import {createGlobalStyle} from "styled-components";
import uniqBy from "lodash/uniqBy";
import {latLng} from "leaflet";

const decorate = flow(observer, inject("state"));

const IconStyle = createGlobalStyle`
  .event-icon {
    text-indent: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--light-blue);
    line-height: 1;
    position: relative;
    transition: transform 0.2s ease-out;
    
    &:hover {
      transform: scale(1.2);
    }
    
    span {
      font-size: 9px;
      font-weight: bold;
      position: absolute;
      top: 0;
      left: 11px;
      color: var(--grey);
      width: max-content;
      &.left {
        left: auto;
        text-align: right;
        right: 11px;
      }
    }
  }
`;

const JourneyEventsLayer = decorate(({journey = null, state}) => {
  const events = useMemo(() => {
    if (!journey || !journey.events || journey.events.length === 0) {
      return [];
    }

    return journey.events;
  }, [journey]);

  const visibleEvents = events.filter((evt) => !!state.journeyEventFilters[evt.type]);

  const visibleTlpEvents = events.filter(
    (evt) =>
      (evt.type === "TLR" || evt.type === "TLA") && !!state.journeyEventFilters[evt.type]
  );

  const eventGroups = uniqBy(visibleEvents, "id").reduce((proximityGroups, event) => {
    if (!event.lat || !event.lng) {
      return proximityGroups;
    }

    const point = latLng([event.lat, event.lng]);
    let currentArea = point.toBounds(3);

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
      .map(({id}, idx) => id + idx)
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
      {visibleTlpEvents.map((event, i) => (
        <JourneyMapEventTlp
          key={`tlp_event_${event.requestId}_${event.type}_${i}`}
          journey={journey}
          event={event}
        />
      ))}
    </>
  );
});

export default JourneyEventsLayer;
