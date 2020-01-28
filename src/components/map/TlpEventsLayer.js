import React from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import {CircleMarker} from "react-leaflet";
import {getDecisionColor, getPriorityColor} from "../../helpers/tlpColor";

const TlpEvent = ({tlpEvent, getColor}) => {
  if (!tlpEvent || !(tlpEvent.lat && tlpEvent.lng)) {
    return null;
  }

  return (
    <CircleMarker
      center={{lat: tlpEvent.lat, lng: tlpEvent.lng}}
      color={getColor()}
      radius={3}
      pane="tlp-events"
    />
  );
};

const decorate = flow(observer, inject("state"));

const TlpEventsLayer = decorate(({state: {date}, tlpEvents = []}) => {
  return tlpEvents.map((tlpEvent, index, arr) => {
    const getColor = () => getPriorityColor(tlpEvent.priorityLevel);
    return (
      <TlpEvent
        key={`tlp_marker_${tlpEvent.requestId}_${tlpEvent.recordedTime}`}
        tlpEvent={tlpEvent}
        getColor={getColor}
      />
    );
  });
});

export default TlpEventsLayer;
