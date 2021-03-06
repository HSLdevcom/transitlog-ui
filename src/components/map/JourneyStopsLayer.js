import React, {useMemo} from "react";
import flow from "lodash/flow";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import get from "lodash/get";
import RouteStop from "./RouteStop";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import {TIMEZONE} from "../../constants";
import moment from "moment-timezone";
import {checkDoorEventsHealth, HealthChecklistValues} from "../../hooks/useJourneyHealth";

const decorate = flow(observer, inject("state"));

const JourneyStopsLayer = decorate(
  ({state: {date, selectedJourney}, showRadius, journey = null}) => {
    let events = (!journey ? [] : journey.events) || [];

    const doorsWorking = useMemo(() => {
      let doorStatus = true;

      checkDoorEventsHealth(
        events,
        (status) => (doorStatus = status === HealthChecklistValues.PASSED)
      );

      return doorStatus;
    }, [events]);

    const stopEvents = useMemo(
      () =>
        events.filter(
          (evt) =>
            ["JourneyStopEvent", "PlannedStopEvent"].includes(evt.__typename) &&
            !!evt.stopId
        ),
      [events]
    );

    // Group stops by ID and sort each group by time and and stop index.
    const stopGroups = useMemo(
      () =>
        orderBy(
          Object.values(groupBy(stopEvents, "stopId")),
          (events) => {
            const eventIndex = get(
              events.find((evt) => typeof evt.index !== "undefined"),
              "index",
              1
            );

            let eventUnix = get(
              events.find((evt) => typeof evt.recordedAtUnix !== "undefined"),
              "recordedAtUnix",
              false
            );

            if (!eventUnix) {
              eventUnix = moment
                .tz(
                  get(
                    events.find((evt) => typeof evt.plannedDateTime !== "undefined"),
                    "plannedDateTime",
                    ""
                  ),
                  TIMEZONE
                )
                .unix();
            }

            // Order by event stop index and unix time.
            return eventUnix * Math.max(eventIndex, 1);
          },
          "asc"
        ),
      [stopEvents]
    );

    return stopGroups.map((events, index, arr) => {
      const isFirst = events.some(
        (evt) => typeof evt.isOrigin !== "undefined" && evt.isOrigin
      );

      const isLast = index === arr.length - 1;

      let useEvent;

      let isTimingOrOrigin = events.some((evt) => evt.isTimingStop || evt.isOrigin);
      let onlyPDE = events.some((evt) => evt.type === "PDE" && evt.loc === "ODO");
      let departureEventType = !onlyPDE && isTimingOrOrigin ? "DEP" : "PDE";

      const arrival = events.find((evt) => evt.type === "ARS");
      let departure =
        events.find((evt) => [departureEventType, "PAS"].includes(evt.type)) || arrival;

      if (!departure) {
        useEvent = events.find((evt) => evt.type === "PLANNED");
        departure = useEvent;

        if (!useEvent) {
          return null;
        }
      } else {
        useEvent = departure;
      }

      return (
        <RouteStop
          key={`journey_stop_marker_${useEvent.stopId}_${useEvent.index}_${useEvent.id}`}
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
          showRadius={showRadius}
          doorsWorking={doorsWorking}
        />
      );
    });
  }
);

export default JourneyStopsLayer;
