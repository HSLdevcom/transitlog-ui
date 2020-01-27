import React, {useMemo, useRef} from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import HfpMarkerLayer from "./HfpMarkerLayer";
import JourneyLayer from "./JourneyLayer";

const decorate = flow(observer, inject("state"));

const UnsignedEventsLayer = decorate(({unsignedEvents, state}) => {
  const {unixTime} = state;
  const prevEvent = useRef(null);

  const currentEvent = useMemo(() => {
    let event = null;
    let currentTimeDiff = 60;

    for (const evt of unsignedEvents) {
      const timeDiff = Math.abs(unixTime - evt.recordedAtUnix);

      if (timeDiff < currentTimeDiff) {
        event = evt;
        currentTimeDiff = timeDiff;
      }

      if (currentTimeDiff < 5) {
        break;
      }
    }

    return event;
  }, [unsignedEvents, unixTime]);

  if (currentEvent) {
    prevEvent.current = currentEvent;
  }

  const useEvent = currentEvent || prevEvent.current;

  const journey = useMemo(() => {
    const journeyEvent = unsignedEvents[0];
    return journeyEvent
      ? {
          journeyType: journeyEvent.journeyType,
          mode: journeyEvent.mode,
          uniqueVehicleId: journeyEvent.uniqueVehicleId,
        }
      : null;
  }, [unsignedEvents[0]]);

  return (
    <>
      <JourneyLayer
        key={`unsigned_line_${journey.uniqueVehicleId}`}
        journey={journey}
        vehiclePositions={unsignedEvents}
        name={`unsigned/${journey.uniqueVehicleId}`}
      />
      {currentEvent && (
        <HfpMarkerLayer
          currentEvent={useEvent}
          isSelectedJourney={false}
          journey={journey}
        />
      )}
    </>
  );
});

export default UnsignedEventsLayer;
