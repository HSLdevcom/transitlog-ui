import React, {useMemo, useRef} from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import HfpMarkerLayer from "./HfpMarkerLayer";
import JourneyLayer from "./JourneyLayer";
import {Marker} from "react-leaflet";
import {divIcon} from "leaflet";

const decorate = flow(
  observer,
  inject("state")
);

const UnsignedEventsLayer = decorate(({unsignedEvents, state}) => {
  const {unixTime, mapDriverEvent} = state;
  const prevEvent = useRef(null);

  console.log(mapDriverEvent);

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

  let icon = null;

  if (mapDriverEvent) {
    icon = divIcon({
      html: `<div class="event-icon" style="background-color: #ccc">${mapDriverEvent.eventType}</div>`,
      iconSize: [8, 8],
    });
  }

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
      {mapDriverEvent && (
        <Marker
          key={mapDriverEvent.id}
          icon={icon}
          position={[mapDriverEvent.lat, mapDriverEvent.lng]}
        />
      )}
    </>
  );
});

export default UnsignedEventsLayer;
