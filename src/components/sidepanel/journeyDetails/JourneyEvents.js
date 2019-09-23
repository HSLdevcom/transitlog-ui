import React, {useCallback, useState, useMemo} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import flow from "lodash/flow";
import merge from "lodash/merge";
import last from "lodash/last";
import uniqBy from "lodash/uniqBy";
import {inject} from "../../../helpers/inject";
import {
  JourneyStopEvent,
  JourneyCancellationEventItem,
  JourneyEvent,
} from "./JourneyEvent";
import EventFilters from "./EventFilters";

const EventsListWrapper = styled.div`
  padding: 0.5rem 0;
`;

const EventsList = styled.div`
  padding: 1rem 0.5rem 0 0;
  width: 100%;
  color: var(--light-grey);
`;

const decorate = flow(
  observer,
  inject("Time", "Filters", "UI")
);

const JourneyEvents = decorate(
  ({events = [], originDeparture, date, color, Filters, UI, Time}) => {
    const eventFilterTypes = useMemo(
      () =>
        events.reduce(
          (eventTypes, event) => {
            const {type} = event;

            if (eventTypes[type]) {
              return eventTypes;
            }

            if (["CANCELLATION", "PLANNED"].includes(type)) {
              eventTypes[type] = true;
            } else {
              eventTypes[type] = false;
            }

            return eventTypes;
          },
          {TIMING_STOP_ARR: true, TERMINAL_ARR: true, DEP: true}
        ),
      [events]
    );

    const [eventFilterState, setFilter] = useState(eventFilterTypes);

    const onFilterChange = useCallback(
      (nextState) => {
        setFilter(merge({}, eventFilterState, nextState));
      },
      [eventFilterState]
    );

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
        <EventFilters onChange={onFilterChange} filterState={eventFilterState} />
        <EventsList>
          {uniqBy(events, "id")
            .filter((event, index, arr) => {
              const eventsOfType = arr.filter((evt) => evt.type === event.type);
              const isFirstOfType = eventsOfType[0] === event;
              const isLastOfType = last(eventsOfType) === event;

              const isTimingStopArr = event.isTimingStop && event.type === "ARR";
              const isTerminalArr =
                (isFirstOfType || isLastOfType) && event.type === "ARR";

              const types = [event.type];

              // Show ARR for timing stops
              if (isTimingStopArr) {
                types.push("TIMING_STOP_ARR");
              }

              // Show ARR for first and last stop
              if (isTerminalArr) {
                types.push("TERMINAL_ARR");
              }

              return types.some((type) => eventFilterState[type]);
            })
            .map((event, index, arr) => {
              let Component = JourneyEvent;

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

              return (
                <Component
                  isFirst={index === 0}
                  isLast={index === arr.length - 1}
                  key={event.id}
                  onHover={onHover}
                  onClick={onClick}
                  event={event}
                  date={date}
                  departure={originDeparture}
                  onSelectTime={onClickTime}
                />
              );
            })}
        </EventsList>
      </EventsListWrapper>
    );
  }
);

export default JourneyEvents;
