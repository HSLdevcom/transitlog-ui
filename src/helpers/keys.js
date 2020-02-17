import get from "lodash/get";
import compact from "lodash/compact";

// Supports both JORE routes as well as HFP journeys.
export function createRouteId(route) {
  const keyParts = [get(route, "routeId"), get(route, "direction")];

  return compact(keyParts).join("/");
}

export function stringifyRoute(route) {
  const parts = [
    get(route, "routeId", ""),
    get(route, "direction", ""),
    get(route, "originStopId", ""),
    get(route, "origin", ""),
    get(route, "destination", ""),
  ];

  return parts.join("/");
}
