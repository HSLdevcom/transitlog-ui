import {action, set} from "mobx";
import moment from "moment-timezone";
import get from "lodash/get";
import {setUrlValue} from "./UrlManager";
import {TIMEZONE} from "../constants";
import {intval} from "../helpers/isWithinRange";

const filterActions = (state) => {
  // Make sure all dates are correctly formed.
  const setDate = action("Set date", (dateValue) => {
    let momentValue = !dateValue ? moment() : moment.tz(dateValue, TIMEZONE);

    if (!momentValue.isValid()) {
      momentValue = moment();
    }

    state.date = momentValue.format("YYYY-MM-DD");
    setUrlValue("date", state.date);
  });

  // Grab the stopId from the passed stop object.
  const setStop = action("Set stop", (stop = "") => {
    // Either get the stopId prop or treat the stop arg as the stopId.
    state.stop = get(stop, "stopId", stop);
    state.objectCenteringAllowed = true;
    setUrlValue("stop", state.stop);

    if (state.stop) {
      state.terminal = "";
      setUrlValue("terminal", state.terminal);
    }
  });

  const setTerminal = action("Set terminal", (terminal = "") => {
    // Either get the stopId prop or treat the stop arg as the stopId.
    state.terminal = get(terminal, "id", terminal);
    state.objectCenteringAllowed = true;
    setUrlValue("terminal", state.terminal);

    if (state.terminal) {
      state.stop = "";
      setUrlValue("stop", state.stop);
    }
  });

  // The unique_vehicle_id we're interested in.
  const setVehicle = action("Set vehicle", (vehicleId) => {
    state.vehicle = vehicleId || "";
    setUrlValue("vehicle", state.vehicle);
  });

  const setRoute = action("Set route", (route) => {
    const {routeId = "", direction = "", originStopId = ""} = route || {};

    state.route.routeId = routeId;
    state.route.direction = intval(direction);
    state.route.originStopId = originStopId;

    setUrlValue("route.routeId", state.route.routeId);
    setUrlValue("route.direction", state.route.direction);
    setUrlValue("route.originStopId", state.route.originStopId);
  });

  const setTimetableFilter = action((filter, value) => {
    if (typeof state.timetableFilters[filter] === "undefined") {
      return;
    }

    state.timetableFilters[filter].pending = value;
    setUrlValue(`timetableFilters.${filter}.pending`, value);
  });

  const applyTimetableFilters = action(() => {
    for (const filterKey of Object.keys(state.timetableFilters)) {
      const pendingValue = state.timetableFilters[filterKey].pending;
      state.timetableFilters[filterKey].current = pendingValue;
      setUrlValue(`timetableFilters.${filterKey}.current`, pendingValue);
    }
  });

  const clearTimetableFilters = action(() => {
    set(state.timetableFilters, {
      route: {current: "", pending: ""},
      minHour: {current: "", pending: ""},
      maxHour: {current: "", pending: ""},
    });

    for (const filterKey of Object.keys(state.timetableFilters)) {
      setUrlValue(`timetableFilters.${filterKey}.pending`, "");
      setUrlValue(`timetableFilters.${filterKey}.current`, "");
    }
  });

  return {
    setDate,
    setStop,
    setTerminal,
    setVehicle,
    setRoute,
    setTimetableFilter,
    applyTimetableFilters,
    clearTimetableFilters,
  };
};

export default filterActions;
