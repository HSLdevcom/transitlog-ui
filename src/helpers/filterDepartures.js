import get from "lodash/get";
import upperCase from "lodash/upperCase";
import {parseLineNumber} from "./parseLineNumber";

const getDirection = (value) => {
  if (!value) {
    return null;
  }

  const intval = typeof value !== "number" ? parseInt(value, 10) : value;
  return isNaN(intval) ? null : intval > 2 ? null : intval;
};

export function filterDepartures(departures, filter) {
  let routeFilter = (get(filter, "routeId", "") || "").replace(/\s/g, "") || undefined;
  const directionFilter = getDirection(get(filter, "direction")) || undefined;
  const min = get(filter, "minHour", -1) || -1;
  const max = get(filter, "maxHour", -1) || -1;

  if (min === -1 && max === -1 && !routeFilter && !directionFilter) {
    return departures;
  }

  routeFilter = upperCase(routeFilter);

  return departures.filter(({routeId, direction, plannedDepartureTime}) => {
    const routeIdFilterTerm = upperCase(parseLineNumber(routeId));
    const directionFilterTerm = getDirection(direction);

    // Filter by route id if filter is set.
    if (
      routeFilter &&
      !(
        routeIdFilterTerm.startsWith(routeFilter) ||
        routeIdFilterTerm.endsWith(routeFilter)
      )
    ) {
      return false;
    }

    if (directionFilter && directionFilterTerm !== directionFilter) {
      return false;
    }

    const departureTime = get(plannedDepartureTime, "departureTime", "");
    const hours = parseInt(departureTime.split(":")[0], 10);

    if (hours && !isNaN(hours)) {
      // If there is a timerange filter set, ignore routes
      // from departures that fall outside the filter.
      if ((min > -1 && hours < min) || (max > -1 && hours > max)) {
        return false;
      }
    }

    return true;
  });
}
