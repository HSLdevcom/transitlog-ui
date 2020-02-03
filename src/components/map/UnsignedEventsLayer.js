import React, {useMemo, useRef} from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import HfpMarkerLayer from "./HfpMarkerLayer";
import JourneyLayer from "./JourneyLayer";
import {useCurrentEvent} from "../../hooks/useCurrentEvent";

const decorate = flow(observer, inject("state"));

const UnsignedEventsLayer = decorate(({unsignedEvents, state}) => {
  const {unixTime} = state;
  const prevEvent = useRef(null);

  const currentEvent = useCurrentEvent(unsignedEvents, unixTime);

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
