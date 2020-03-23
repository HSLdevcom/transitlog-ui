import React, {useCallback, useMemo, useEffect} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import flow from "lodash/flow";
import last from "lodash/last";
import uniqBy from "lodash/uniqBy";
import get from "lodash/get";
import {inject} from "../../helpers/inject";
import {
  JourneyStopEvent,
  JourneyCancellationEventItem,
  JourneyTlpEvent,
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

const decorate = flow(observer, inject("Time", "Filters", "UI", "Journey"));

const JourneyEvents = decorate(
  ({events = [], originDeparture, date, Filters, UI, Time, Journey, state, color}) => {
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
          {ALL: false, TIMING_STOP_ARS: true, TERMINAL_ARS: true, DEPARTURE: true}
        ),
      [events]
    );

    useEffect(() => {
      Journey.setJourneyEventFilter(eventFilterTypes, true);
    }, []);

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

    const visibleEvents = events.filter((event, index, arr) => {
      const eventsOfType = arr.filter((evt) => evt.type === event.type);
      const isLastOfType = last(eventsOfType) === event;

      // The origin stop is the PLANNED origin stop, not necessarily always
      // the first stop that the vehicle arrived at.
      const isOrigin = event.isOrigin === true;
      const isTimingStop = event.isTimingStop === true;

      const isTimingStopArr = event.isTimingStop && event.type === "ARS";
      const isTerminalArr = (isOrigin || isLastOfType) && event.type === "ARS";

      const types = [event.type];

      // Special departure filter for the relevant departure event for this stop.
      // DEP for origins and timing stops, PDE for everything else.
      if (
        event.type === "PAS" ||
        (typeof event.isOrigin !== "undefined" &&
          (isOrigin || isTimingStop) &&
          event.type === "DEP") ||
        (typeof event.isOrigin !== "undefined" &&
          !(isOrigin || isTimingStop) &&
          event.type === "PDE")
      ) {
        types.push("DEPARTURE");
      }

      // Show ARR for timing stops
      if (isTimingStopArr) {
        types.push("TIMING_STOP_ARS");
      }

      // Show ARR for first and last stop
      if (isTerminalArr) {
        types.push("TERMINAL_ARS");
      }

      return types.some((type) => state.journeyEventFilters[type]);
    });

    return (
      <EventsListWrapper>
        <EventFilters
          onChange={Journey.setJourneyEventFilter}
          filterState={state.journeyEventFilters}
        />
        <EventsList>
          {uniqBy(visibleEvents, "id").map((event, index, arr) => {
            let Component = JourneyEvent;

            switch (event.__typename) {
              case "PlannedStopEvent":
              case "JourneyStopEvent":
                Component = JourneyStopEvent;
                break;
              case "JourneyCancellationEvent":
                Component = JourneyCancellationEventItem;
                break;
              case "JourneyTlpEvent":
                Component = JourneyTlpEvent;
                break;
              default:
                Component = JourneyEvent;
            }

            return (
              <Component
                isOrigin={get(originDeparture, "stopId", "") === event.stopId}
                isFirst={index === 0}
                isLast={index === arr.length - 1}
                key={event.id}
                onHover={onHover}
                onClick={onClick}
                event={event}
                date={date}
                departure={originDeparture}
                onSelectTime={onClickTime}
                color={color}
              />
            );
          })}
        </EventsList>
      </EventsListWrapper>
    );
  }
);

export default JourneyEvents;
