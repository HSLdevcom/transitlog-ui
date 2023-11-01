import BusIcon from "../icons/Bus";
import TramIcon from "../icons/Tram";
import RailIcon from "../icons/Rail";
import LRailIcon from "../icons/LRail";
import SubwayIcon from "../icons/Subway";
import FerryIcon from "../icons/Ferry";
import React from "react";
import get from "lodash/get";
import ReactDOMServer from "react-dom/server";
import BusRectangle from "../icons/BusRectangle";
import TramRectangle from "../icons/TramRectangle";
import RailRectangle from "../icons/RailRectangle";
import LRailRectangle from "../icons/LRailRectangle";
import FerryRectangle from "../icons/FerryRectangle";
import SubwaySign from "../icons/SubwaySign";

const iconCache = {};

const cacheIcon = (name, size, html) => (iconCache[`${name}:${size}`] = html);
const getCachedIcon = (name, size) => iconCache[`${name}:${size}`] || null;

export const transportIconsHtml = {
  BUS: (size = 20) =>
    ReactDOMServer.renderToStaticMarkup(
      <BusRectangle
        width={size}
        height={size}
        fill={{inner: "white", outer: "var(--bus-blue)"}}
      />
    ),
  TRAM: (size = 20) =>
    ReactDOMServer.renderToStaticMarkup(
      <TramRectangle
        width={size}
        height={size}
        fill={{inner: "white", outer: "var(--green)"}}
      />
    ),
  TRUNK: (size = 20) =>
    ReactDOMServer.renderToStaticMarkup(
      <BusRectangle
        width={size}
        height={size}
        fill={{inner: "white", outer: "var(--orange)"}}
      />
    ),
  RAIL: (size = 20) =>
    ReactDOMServer.renderToStaticMarkup(
      <RailRectangle
        width={size}
        height={size}
        fill={{inner: "white", outer: "var(--purple)"}}
      />
    ),
  L_RAIL: (size = 20) =>
    ReactDOMServer.renderToStaticMarkup(
      <LRailRectangle
        width={size}
        height={size}
        fill={{inner: "white", outer: "var(--l_rail-green)"}}
      />
    ),
  SUBWAY: (size = 20) =>
    ReactDOMServer.renderToStaticMarkup(
      <SubwaySign
        width={size}
        height={size}
        fill={{inner: "white", outer: "var(--orange)"}}
      />
    ),
  METRO: (size = 20) =>
    ReactDOMServer.renderToStaticMarkup(
      <SubwaySign
        width={size}
        height={size}
        fill={{inner: "white", outer: "var(--orange)"}}
      />
    ),
  FERRY: (size = 20) =>
    ReactDOMServer.renderToStaticMarkup(
      <FerryRectangle
        width={size}
        height={size}
        fill={{inner: "white", outer: "var(--light-blue)"}}
      />
    ),
  DEFAULT: (size = 20) =>
    ReactDOMServer.renderToStaticMarkup(
      <BusRectangle
        width={size}
        height={size}
        fill={{inner: "white", outer: "var(--bus-blue)"}}
      />
    ),
};

export const getTransportIconHtml = (name, size) => {
  let icon = getCachedIcon(name, size);
  if (icon) {
    return icon;
  }

  icon = transportIconsHtml[name](size);
  cacheIcon(name, size, icon);

  return icon;
};

export const transportIcons = {
  BUS: BusIcon,
  TRUNK: BusIcon,
  TRAM: TramIcon,
  RAIL: RailIcon,
  L_RAIL: LRailIcon,
  SUBWAY: SubwayIcon,
  METRO: SubwayIcon,
  FERRY: FerryIcon,
};

export const transportColor = {
  BUS: "var(--bus-blue)",
  TRUNK: "var(--orange)",
  TRAM: "var(--green)",
  RAIL: "var(--purple)",
  L_RAIL: "var(--l_rail-green)",
  SUBWAY: "var(--orange)",
  METRO: "var(--orange)",
  FERRY: "var(--light-blue)",
};

export const TransportIcon = ({className, mode = "", width = 16, height = 16}) => {
  if (!mode || typeof mode !== "string" || !get(transportIcons, mode, false)) {
    return null;
  }

  return React.createElement(get(transportIcons, mode.toUpperCase()), {
    className,
    fill: get(transportColor, mode.toUpperCase(), "var(--light-grey)"),
    width,
    height,
  });
};
