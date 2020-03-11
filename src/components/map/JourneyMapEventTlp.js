import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import React from "react";
import {Marker} from "react-leaflet";
import {divIcon} from "leaflet";
import {useToggle} from "../../hooks/useToggle";
import TlpTooltip from "./TlpTooltip";

const decorate = flow(observer);

const JourneyMapEventTlp = decorate(({event, journey}) => {
  const [tooltipOpen] = useToggle(false);

  const color =
    event.type === "TLA"
      ? "var(--dark-blue)"
      : event.decision && event.decision === "ACK"
      ? "var(--green)"
      : "black";

  const icon = divIcon({
    html: `<div class="event-icon" style="
      width: 100%;
      height: 100%; 
      background-color: ${color}; 
      border: 0.12rem solid white;">
    </div>`,
    iconSize: [10, 10],
  });

  return (
    <Marker
      icon={icon}
      position={{lat: event.lat, lng: event.lng}}
      pane={event.type === "TLR" ? "tlr-events" : "tla-events"}>
      <TlpTooltip
        key={`permanent=${tooltipOpen}`}
        journey={journey}
        event={event}
        permanent={tooltipOpen}
        sticky={false}
      />
    </Marker>
  );
});

export default JourneyMapEventTlp;
