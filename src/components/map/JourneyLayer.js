import React, {useCallback, useState, useRef, useMemo, useEffect} from "react";
import {Polyline, CircleMarker, FeatureGroup, Tooltip, Marker} from "react-leaflet";
import {latLng, Icon} from "leaflet";
import get from "lodash/get";
import last from "lodash/last";
import orderBy from "lodash/orderBy";
import flow from "lodash/flow";
import getDelayType from "../../helpers/getDelayType";
import {observer} from "mobx-react-lite";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import HfpTooltip from "./HfpTooltip";
import {inject} from "../../helpers/inject";
import stoppedIcon from "../../img/exclamation.svg";
import {Text} from "../../helpers/text";

export function getLineChunksByDelay(events) {
  // Get only the events from the same journey and create latLng items for Leaflet.
  // Additional data can be passed as the third array element which Leaflet won't touch.
  return events
    .filter((pos) => !!pos.lat && !!pos.lng)
    .reduce((allChunks, event) => {
      const isUnsigned = get(event, "journeyType", "journey") !== "journey";
      const eventDelay = get(event, "delay", 0);
      const delayType = isUnsigned ? "unsigned" : getDelayType(-eventDelay); // "early", "late" or "on-time"

      // If this is the first event, allChunks will be empty.
      // Add it as a new chunk to kick things off.
      if (allChunks.length === 0) {
        allChunks.push({delayType, events: [event]});
        return allChunks;
      }

      // Check the previous chunk to determine if we want to push
      // `event` onto the previous chunk or start a new chunk for it.
      const previousChunk = last(allChunks);
      const previousDelayType = get(previousChunk, "delayType", "on-time");

      const prevTime = get(last(previousChunk.events), "recordedAtUnix", 0);
      const currentTime = event.recordedAtUnix;

      const isSeparate = Math.abs(currentTime - prevTime) > 60;

      // If the delay types are the same, add the event to the last chunk.
      if (delayType === previousDelayType && !isSeparate) {
        previousChunk.events.push(event);
      } else {
        // Otherwise start a new chunk. Include the last element from the
        // previous chunk to eliminate gaps in the line.
        allChunks.push({
          delayType,
          events: isSeparate ? [event] : [last(previousChunk.events), event],
        });
      }

      return allChunks;
    }, []);
}

const decorate = flow(
  observer,
  inject("state")
);

const JourneyLayer = decorate(
  ({name, journey, state, vehiclePositions = journey.vehiclePositions}) => {
    const eventLines = useMemo(() => getLineChunksByDelay(vehiclePositions), [
      vehiclePositions,
    ]);

    // Find places during the journey where the vehicle was stopped for
    // an abnormal duration.
    const stoppedAtPositions = useMemo(() => {
      const stopped = [];
      let prevEvent = null;
      let firstStationaryEvent = null; // The event that marks the start of the stationary period.
      let stationaryDuration = 0; // The duration during which the vehicle was stopped.

      for (const event of vehiclePositions) {
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
    }, [vehiclePositions]);

    const [eventAtHover, setHoverEvent] = useState(null);

    const mouseOver = useRef(false);
    const mouseOut = useRef(false);
    const mouseOutTimer = useRef(0);

    const findHfpItem = useCallback(
      (latlng) => {
        const eventItem = orderBy(
          vehiclePositions,
          (event) =>
            !event.lat || !event.lng
              ? Infinity
              : latlng.distanceTo(latLng(event.lat, event.lng)),
          "ASC"
        )[0];

        return eventItem || null;
      },
      [vehiclePositions]
    );

    const onMouseout = useCallback(() => {
      mouseOut.current = true;

      mouseOutTimer.current = setTimeout(() => {
        if (mouseOut.current) {
          mouseOut.current = false;
          mouseOver.current = false;
          setHoverEvent(null);
        }
      }, 1000);
    }, [mouseOut.current]);

    const onHover = useCallback(() => {
      mouseOut.current = false;
      mouseOver.current = true;
    }, []);

    const onMousemove = useCallback(
      (event) => {
        const eventItem = findHfpItem(event.latlng);

        if (eventItem) {
          setHoverEvent(eventItem);
        }
      },
      [vehiclePositions]
    );

    const stoppedMarkerIcon = useMemo(
      () =>
        new Icon({
          iconUrl: stoppedIcon,
          iconSize: [8, 32],
          iconAnchor: [4, 32],
        }),
      []
    );

    // Clear the timer to avoid "cannot update unmounted component" errors.
    useEffect(() => () => clearTimeout(mouseOutTimer.current));

    return (
      <FeatureGroup
        onMousemove={onMousemove}
        onMouseover={onHover}
        onMouseout={onMouseout}>
        {eventLines.map((delayChunk, index) => {
          const chunkDelayType = get(delayChunk, "delayType", "on-time");
          const chunkEvents = get(delayChunk, "events", []);
          const points = chunkEvents.map((pos) => latLng([pos.lat, pos.lng]));

          return (
            <React.Fragment key={`event_polyline_${name}_chunk_${index}`}>
              <Polyline
                pane="event-lines"
                weight={3}
                color={getTimelinessColor(chunkDelayType, "var(--light-green)")}
                positions={points}
                interactive={false}
              />
              <Polyline
                pane="event-hover"
                weight={50}
                color="transparent"
                positions={points}
              />
            </React.Fragment>
          );
        })}
        {state.mapOverlays.includes("Stopped vehicle") &&
          stoppedAtPositions.map(({event, duration}) => (
            <Marker
              icon={stoppedMarkerIcon}
              pane="stopped-markers"
              key={`stopped_at_${event.recordedAtUnix}_${duration}`}
              position={latLng([event.lat, event.lng])}>
              <Tooltip>
                <Text>map.vehicle_stopped_duration_label</Text>{" "}
                {Math.round(duration / 60)} min
              </Tooltip>
            </Marker>
          ))}
        {eventAtHover && (
          <CircleMarker interactive={false} center={eventAtHover} radius={6}>
            <HfpTooltip permanent={true} journey={journey} event={eventAtHover} />
          </CircleMarker>
        )}
      </FeatureGroup>
    );
  }
);

export default JourneyLayer;
