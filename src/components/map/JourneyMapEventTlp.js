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

  const color = event.type === "TLR" ? "var(--orange)" : "var(--black)";

  const icon = divIcon({
    html: `<div class="event-icon" style="background-color: ${color}"></div>`,
    iconSize: [8, 8],
  });

  const center = {lat: event.lat, lng: event.lng};

  return (
    <Marker icon={icon} position={center} pane="hfp-events">
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
