import BusIcon from "../icons/Bus";
import TramIcon from "../icons/Tram";
import RailIcon from "../icons/Rail";
import SubwayIcon from "../icons/Subway";
import FerryIcon from "../icons/Ferry";
import React from "react";
import get from "lodash/get";

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
