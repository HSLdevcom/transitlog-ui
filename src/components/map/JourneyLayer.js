import React, {Component, useMemo} from "react";
import {Polyline, CircleMarker, FeatureGroup} from "react-leaflet";
import {latLng} from "leaflet";
import get from "lodash/get";
import last from "lodash/last";
import orderBy from "lodash/orderBy";
import getDelayType from "../../helpers/getDelayType";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import {observable, action} from "mobx";
import HfpTooltip from "./HfpTooltip";

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

@inject(app("state"))
@observer
class JourneyLayer extends Component {
  @observable.ref
  eventAtHover = null;

  mouseOver = false;
  mouseOut = false;

  setEventAtHover = action((event) => {
    this.eventAtHover = event;
  });

  findHfpItem = (events = [], latlng) => {
    const eventItem = orderBy(
      events,
      (event) =>
        !event.lat || !event.lng
          ? Infinity
          : latlng.distanceTo(latLng(event.lat, event.lng)),
      "ASC"
    )[0];

    return eventItem || null;
  };

  onMouseout = () => {
    this.mouseOut = true;

    setTimeout(() => {
      if (this.mouseOut) {
        this.mouseOut = false;
        this.mouseOver = false;
        this.setEventAtHover(null);
      }
    }, 1000);
  };

  onHover = () => {
    this.mouseOut = false;
    this.mouseOver = true;
  };

  onMousemove = (events) => (event) => {
    const eventItem = this.findHfpItem(events, event.latlng);

    if (eventItem) {
      this.setEventAtHover(eventItem);
    }
  };

  render() {
    const {name, journey, vehiclePositions = journey.vehiclePositions} = this.props;
    const eventLines = getLineChunksByDelay(vehiclePositions);

    return (
      <FeatureGroup
        onMousemove={this.onMousemove(vehiclePositions)}
        onMouseover={this.onHover}
        onMouseout={this.onMouseout}>
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
        {this.eventAtHover && (
          <CircleMarker interactive={false} center={this.eventAtHover} radius={6}>
            <HfpTooltip permanent={true} journey={journey} event={this.eventAtHover} />
          </CircleMarker>
        )}
      </FeatureGroup>
    );
  }
}

export default JourneyLayer;
