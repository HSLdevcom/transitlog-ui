import React from "react";
import ReactDOMServer from "react-dom/server";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import {Marker} from "react-leaflet";
import {divIcon} from "leaflet";
import Logout from "../../icons/Logout";
import Latest from "../../icons/Latest";
import Checkmark from "../../icons/Checkmark";
import Checkmark2 from "../../icons/Checkmark2";

const decorate = flow(
  observer,
  inject("state")
);

const loginIconHTML = ReactDOMServer.renderToStaticMarkup(
  <Checkmark2 width={14} height={14} fill="var(--green)" />
);

const logoutIconHTML = ReactDOMServer.renderToStaticMarkup(
  <Logout width={16} height={16} fill="var(--red)" />
);

const DriverEventLayer = decorate(({state}) => {
  const {mapDriverEvent} = state;

  let icon = null;

  if (mapDriverEvent) {
    icon = divIcon({
      html: `<div style="
width: 100%;
height: 100%;
border-radius: 50%;
border: 3px solid var(--grey);
text-indent: 0;
display: flex;
align-items: center;
justify-content: center;
background-color: white">${
        mapDriverEvent.eventType === "DA" ? loginIconHTML : logoutIconHTML
      }</div>`,
      iconSize: [30, 30],
    });
  }

  if (!mapDriverEvent) {
    return null;
  }

  return (
    <Marker
      key={mapDriverEvent.id}
      icon={icon}
      position={[mapDriverEvent.lat, mapDriverEvent.lng]}
      pane="hfp-markers"
    />
  );
});

export default DriverEventLayer;
