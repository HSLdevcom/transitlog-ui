import React, {useMemo} from "react";
import {Polyline} from "react-leaflet";
import {observer} from "mobx-react-lite";
import {interpolateRange} from "../../helpers/interpolateRange";

const SimpleHfpLayer = observer((props) => {
  const {zoom, name, events} = props;

  const validEvents = useMemo(() => events.filter((evt) => !!evt.lat && !!evt.lng), [
    events,
  ]);

  // Adjust opacity and line width based on the zoom level. This ensures that the lines
  // are visible but not too overpowering through all zoom levels.
  const opacity = interpolateRange(zoom, 15, 20, 0.05, 0.5, 0.2);
  const weight = interpolateRange(zoom, 15, 20, 2, 5, 0.2);

  return (
    <Polyline
      key={`hfp_polyline_${name}`}
      pane="event-lines"
      weight={weight}
      color="var(--red)"
      opacity={opacity}
      positions={validEvents.map((pos) => [pos.lat, pos.lng])}
    />
  );
});

export default SimpleHfpLayer;
