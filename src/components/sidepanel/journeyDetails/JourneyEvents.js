import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import flow from "lodash/flow";
import uniqBy from "lodash/uniqBy";
import {inject} from "../../../helpers/inject";
import {
  JourneyStopEvent,
  JourneyCancellationEventItem,
  JourneyEvent,
} from "./JourneyEvent";

const EventsListWrapper = styled.div`
  padding: 1rem 0;
`;

const EventsList = styled.div`
  padding: 0 0.5rem 0 0;
  width: 100%;
  color: var(--light-grey);
`;

const decorate = flow(
  observer,
  inject("Time", "Filters", "UI")
);

const JourneyEvents = decorate(({events = [], date, color, Filters, UI, Time}) => {
  const onClickTime = useCallback(
    (time) => {
      Time.setTime(time);
    },
    [Time]
  );

  const onClick = useCallback(
    (stopId) => {
      if (stopId) {
        Filters.setStop(stopId);
      }
    },
    [Filters]
  );

  const onHover = useCallback(
    (stopId) => {
      UI.highlightStop(stopId);
    },
    [UI]
  );

  if (events.length === 0) {
    return null;
  }

  return (
    <EventsListWrapper>
      <EventsList>
        {uniqBy(events, "id").map((event, index) => {
          let Component = null;

          switch (event.type) {
            case "DEP":
            case "ARR":
            case "PLANNED":
              Component = JourneyStopEvent;
              break;
            case "CANCELLATION":
              Component = JourneyCancellationEventItem;
              break;
            default:
              Component = JourneyEvent;
          }

          if (!Component) {
            return null;
          }

          return (
            <Component
              key={event.id}
              onHover={onHover}
              onClick={onClick}
              event={event}
              date={date}
              isFirst={index === 0}
              onSelectTime={onClickTime}
            />
          );
        })}
      </EventsList>
    </EventsListWrapper>
  );
});

export default JourneyEvents;
