import flow from "lodash/flow";
import orderBy from "lodash/orderBy";
import {observer} from "mobx-react-lite";
import React from "react";
import {Marker, Tooltip} from "react-leaflet";
import {divIcon, latLngBounds} from "leaflet";
import {text} from "../../helpers/text";
import moment from "moment-timezone";
import {TIMEZONE} from "../../constants";

const decorate = flow(observer);

const JourneyMapEvent = decorate(({eventGroup}) => {
  const orderedEvents = orderBy(eventGroup.events, "recordedAtUnix");

  const eventTypesContent = `<span>${orderedEvents
    .map(({type}) => type)
    .join("<br />")}</span>`;

  const icon = divIcon({
    html: `<div class="event-icon">${eventTypesContent}</div>`,
    iconSize: [15, 15],
  });

  const center =
    eventGroup.positions.length === 1
      ? eventGroup.positions[0]
      : latLngBounds(eventGroup.positions).getCenter();

  return (
    <Marker icon={icon} position={center} pane="hfp-events">
      <Tooltip>
        {orderedEvents.map((event) => (
          <div key={`${event.type}_${event.recordedAtUnix}`}>
            <span style={{marginRight: "0.5rem"}}>
              {moment.tz(event.recordedAt, TIMEZONE).format("HH:mm:ss")}
            </span>
            <strong
              dangerouslySetInnerHTML={{__html: text(`journey.event.${event.type}`)}}
            />
          </div>
        ))}
      </Tooltip>
    </Marker>
  );
});

export default JourneyMapEvent;
