import React from "react";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import RouteSelect from "../RouteSelect";

const decorate = flow(observer);

export const StopRouteSelect = decorate(({stop, color}) => {
  const routes = stop.routes || [];

  return;
});

export default StopRouteSelect;
