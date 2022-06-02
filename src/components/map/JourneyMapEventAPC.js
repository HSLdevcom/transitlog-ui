import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import React from "react";
import {Marker, Tooltip} from "react-leaflet";
import {divIcon} from "leaflet";
import {useToggle} from "../../hooks/useToggle";
import ApcTooltip from "./ApcTooltip";

const decorate = flow(observer);

const JourneyMapEventAPC = decorate(({event, journey}) => {
  const [tooltipOpen] = useToggle(false);

  const icon = divIcon({
    html: `<div class="event-icon" style="background-color: var(--light-blue)">APC</div>`,
    iconSize: [8, 8],
  });
  return (
    <Marker icon={icon} position={{lat: event.lat, lng: event.lng}} pane="hfp-events">
      <ApcTooltip
        key={`permanent=${tooltipOpen}`}
        journey={journey}
        event={event}
        permanent={tooltipOpen}
        sticky={false}
      />
    </Marker>
  );
});

export default JourneyMapEventAPC;
