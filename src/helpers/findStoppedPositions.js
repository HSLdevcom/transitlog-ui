import {latLng} from "leaflet";

export const findStoppedPositions = (positions) => {
  const stopped = [];
  let prevEvent = null;
  let firstStationaryEvent = null; // The event that marks the start of the stationary period.
  let stationaryDuration = 0; // The duration during which the vehicle was stopped.

  for (const event of positions) {
    if (!event.lat || !event.lng) {
      continue;
    }

    if (prevEvent) {
      let distance = 0; // Distance to the first stopped event or the previous event
      const eventPosition = latLng([event.lat, event.lng]);

      // Measure the distance between the current event and the start of a potential
      // stopped stop incident, or the previous event to determine if a stopped incdent
      // is happening.
      if (firstStationaryEvent) {
        distance = eventPosition.distanceTo([
          firstStationaryEvent.lat,
          firstStationaryEvent.lng,
        ]);
      } else {
        distance = eventPosition.distanceTo([prevEvent.lat, prevEvent.lng]);
      }

      // If the distance is under 10 meters, start counting stopped duration.
      if (distance <= 10) {
        // If this event is starting a stopped incident, set it as the place where
        // the vehicle stopped.
        if (!firstStationaryEvent) {
          firstStationaryEvent = event;
        }

        // Count how long the vehicle has been stopped by deducting the unix timestamp
        // of the initial stopped event from the current unix timestamp.
        stationaryDuration = Math.abs(
          event.recordedAtUnix - firstStationaryEvent.recordedAtUnix
        );

        continue;
      } else if (firstStationaryEvent && stationaryDuration >= 5 * 60) {
        // If the distance is longer than 10 meters and the stopped duration is more
        // than 5 minutes, set the current firstStationaryEvent as a stopped event.
        stopped.push({duration: stationaryDuration, event: firstStationaryEvent});
      }

      // Clear the tracking variables and be ready to detect the next stopped incident.
      stationaryDuration = 0;
      firstStationaryEvent = null;
    }

    // Set the prevEvent so we have something to measure the distance against.
    prevEvent = event;
  }

  return stopped;
};
