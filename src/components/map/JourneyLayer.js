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
import {findStoppedPositions} from "../../helpers/findStoppedPositions";

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

const decorate = flow(observer, inject("state"));

const JourneyLayer = decorate(
  ({name, journey, state, vehiclePositions = journey.vehiclePositions}) => {
    const eventLines = useMemo(() => getLineChunksByDelay(vehiclePositions), [
      vehiclePositions,
    ]);

    // Find places during the journey where the vehicle was stopped for
    // an abnormal duration.
    const stoppedAtPositions = useMemo(() => findStoppedPositions(vehiclePositions), [
      vehiclePositions,
    ]);

    const [eventAtHover, setHoverEvent] = useState(null);

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
      mouseOutTimer.current = setTimeout(() => {
        setHoverEvent(null);
      }, 500);
    }, []);

    const onHover = useCallback(() => {
      clearTimeout(mouseOutTimer.current);
    }, [mouseOutTimer.current]);

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
    useEffect(() => () => clearTimeout(mouseOutTimer.current), [mouseOutTimer.current]);

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
