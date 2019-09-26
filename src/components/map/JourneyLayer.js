import React, {Component} from "react";
import {Polyline} from "react-leaflet";
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

      // If the delay types are the same, add the event to the last chunk.
      if (delayType === previousDelayType) {
        previousChunk.events.push(event);
      } else {
        // Otherwise start a new chunk. Include the last element from the
        // previous chunk to eliminate gaps in the line.
        allChunks.push({
          delayType,
          events: [last(previousChunk.events), event],
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

  setEventAtHover = action((event) => {
    this.eventAtHover = event;
  });

  findHfpItem = (events = [], latlng) => {
    const eventItem = orderBy(
      events,
      (event) => latlng.distanceTo(latLng(event.lat, event.lng)),
      "ASC"
    )[0];

    return eventItem || null;
  };

  onMouseout = (event) => {
    const line = event.target;
    line.setStyle({weight: 3});
    this.mouseOver = false;
  };

  onHover = (event) => {
    this.mouseOver = true;
    const line = event.target;
    line.setStyle({weight: 10});
  };

  onMousemove = (events) => (event) => {
    if (!this.mouseOver) {
      this.setEventAtHover(null);
      return;
    }

    const eventItem = this.findHfpItem(events, event.latlng);

    if (eventItem) {
      this.setEventAtHover(eventItem);
    }
  };

  render() {
    const {name, journey} = this.props;
    const eventLines = getLineChunksByDelay(journey.vehiclePositions);

    return (
      <>
        {eventLines.map((delayChunk, index) => {
          const chunkDelayType = get(delayChunk, "delayType", "on-time");
          const chunkEvents = get(delayChunk, "events", []);
          const points = chunkEvents.map((pos) => latLng([pos.lat, pos.lng]));

          return (
            <Polyline
              key={`event_polyline_${name}_chunk_${index}`}
              onMousemove={this.onMousemove(chunkEvents)}
              onMouseover={this.onHover}
              onMouseout={this.onMouseout}
              pane="event-lines"
              weight={3}
              color={getTimelinessColor(chunkDelayType, "var(--light-green)")}
              positions={points}>
              <HfpTooltip journey={journey} event={this.eventAtHover} />
            </Polyline>
          );
        })}
      </>
    );
  }
}

export default JourneyLayer;
