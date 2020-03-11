import flow from "lodash/flow";
import orderBy from "lodash/orderBy";
import {observer} from "mobx-react-lite";
import React from "react";
import {Marker, Tooltip} from "react-leaflet";
import {divIcon, latLngBounds} from "leaflet";
import {text} from "../../helpers/text";
import moment from "moment-timezone";
import {TIMEZONE, STOP_EVENTS} from "../../constants";

const decorate = flow(observer);

const JourneyMapEvent = decorate(({eventGroup, rightText = true}) => {
  const isStopEvent = eventGroup.events.some(({type}) => STOP_EVENTS.includes(type));
  const orderedEvents = orderBy(eventGroup.events, "recordedAtUnix");

  const eventTypesContent = `<span class="${rightText ? "right" : "left"}">${orderedEvents
    .map((evt) =>
      // Show Sid (junctionId) for TLP events
      evt.type === "TLR" && evt.junctionId && evt.attemptSeq
        ? `TLR ${evt.attemptSeq} Sid: ${evt.junctionId}`
        : evt.type === "TLA" && evt.junctionId
        ? `TLA Sid: ${evt.junctionId}`
        : evt.type
    )
    .join("<br />")}</span>`;

  const color = isStopEvent ? "var(--light-blue)" : "var(--dark-blue)";

  const icon = divIcon({
    html: `<div class="event-icon" style="background-color: ${color}">${eventTypesContent}</div>`,
    iconSize: [8, 8],
  });

  const center =
    eventGroup.positions.length === 1
      ? eventGroup.positions[0]
      : latLngBounds(eventGroup.positions).getCenter();

  return (
    <Marker icon={icon} position={center} pane="hfp-events">
      <Tooltip
        direction={rightText ? "left" : "right"}
        interactive={false}
        offset={[rightText ? -10 : 10, 0]}>
        {orderedEvents.map((event, idx) => (
          <div key={`${event.type}_${event.recordedAtUnix}_${idx}`}>
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
