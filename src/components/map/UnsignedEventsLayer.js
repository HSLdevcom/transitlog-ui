import React, {useMemo, useRef} from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import HfpMarkerLayer from "./HfpMarkerLayer";

const decorate = flow(
  observer,
  inject("state")
);

const UnsignedEventsLayer = decorate(({unsignedEvents, state}) => {
  const {unixTime} = state;
  const prevEvent = useRef(null);

  const currentEvent = useMemo(() => {
    let event = null;
    let currentTimeDiff = 1200;

    for (const evt of unsignedEvents) {
      const timeDiff = Math.abs(unixTime - evt.recordedAtUnix);

      if (timeDiff < currentTimeDiff) {
        event = evt;
        currentTimeDiff = timeDiff;
      }
    }

    return event;
  }, [unsignedEvents, unixTime]);

  if (currentEvent) {
    prevEvent.current = currentEvent;
  }

  const useEvent = currentEvent || prevEvent.current;

  return currentEvent ? (
    <HfpMarkerLayer
      key={`unsigned_event_${useEvent.id}`}
      currentEvent={useEvent}
      isSelectedJourney={false}
      journey={{journeyType: useEvent.journeyType, mode: useEvent.mode}}
    />
  ) : null;
});

export default UnsignedEventsLayer;
