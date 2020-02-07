import BusIcon from "../icons/Bus";
import TramIcon from "../icons/Tram";
import RailIcon from "../icons/Rail";
import SubwayIcon from "../icons/Subway";
import FerryIcon from "../icons/Ferry";
import React from "react";
import get from "lodash/get";
import ReactDOMServer from "react-dom/server";
import BusRectangle from "../icons/BusRectangle";
import TramRectangle from "../icons/TramRectangle";
import RailRectangle from "../icons/RailRectangle";
import FerryRectangle from "../icons/FerryRectangle";
import SubwaySign from "../icons/SubwaySign";

export const transportIconsHtml = {
  BUS: ReactDOMServer.renderToStaticMarkup(
    <BusRectangle
      width={20}
      height={20}
      fill={{inner: "white", outer: "var(--bus-blue)"}}
    />
  ),
  TRAM: ReactDOMServer.renderToStaticMarkup(
    <TramRectangle
      width={20}
      height={20}
      fill={{inner: "white", outer: "var(--green)"}}
    />
  ),
  TRUNK: ReactDOMServer.renderToStaticMarkup(
    <BusRectangle
      width={20}
      height={20}
      fill={{inner: "white", outer: "var(--orange)"}}
    />
  ),
  RAIL: ReactDOMServer.renderToStaticMarkup(
    <RailRectangle
      width={20}
      height={20}
      fill={{inner: "white", outer: "var(--purple)"}}
    />
  ),
  SUBWAY: ReactDOMServer.renderToStaticMarkup(
    <SubwaySign width={20} height={20} fill={{inner: "white", outer: "var(--orange)"}} />
  ),
  METRO: ReactDOMServer.renderToStaticMarkup(
    <SubwaySign width={20} height={20} fill={{inner: "white", outer: "var(--orange)"}} />
  ),
  FERRY: ReactDOMServer.renderToStaticMarkup(
    <FerryRectangle
      width={20}
      height={20}
      fill={{inner: "white", outer: "var(--light-blue)"}}
    />
  ),
  DEFAULT: ReactDOMServer.renderToStaticMarkup(
    <BusRectangle
      width={20}
      height={20}
      fill={{inner: "white", outer: "var(--bus-blue)"}}
    />
  ),
};

export const transportIcons = {
  BUS: BusIcon,
  TRUNK: BusIcon,
  TRAM: TramIcon,
  RAIL: RailIcon,
  SUBWAY: SubwayIcon,
  METRO: SubwayIcon,
  FERRY: FerryIcon,
};

export const transportColor = {
  BUS: "var(--bus-blue)",
  TRUNK: "var(--orange)",
  TRAM: "var(--green)",
  RAIL: "var(--purple)",
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
