import {action} from "mobx";
import {getJourneyObject} from "../helpers/getJourneyObject";
import filterActions from "./filterActions";
import {setPathName} from "./UrlManager";
import get from "lodash/get";
import merge from "lodash/merge";
import timeActions from "./timeActions";
import {intval} from "../helpers/isWithinRange";

export function createJourneyPath(journey) {
  const dateStr = journey.departureDate.replace(/-/g, "");
  const timeStr = journey.departureTime.replace(/:/g, "");
  return `/journey/${dateStr}/${timeStr}/${journey.routeId}/${journey.direction}/${(
    journey.uniqueVehicleId || ""
  ).replace("/", "_")}`;
}

export function createCompositeJourney(date, route, time, uniqueVehicleId = "") {
  if (!route || !route.routeId || !date || !time) {
    return false;
  }

  return {
    departureDate: date,
    departureTime: time,
    routeId: route.routeId,
    direction: intval(route.direction),
    originStopId: get(route, "originStopId", get(route, "stopId", "")),
    uniqueVehicleId,
  };
}

export default (state) => {
  const filters = filterActions(state);
  const time = timeActions(state);

  // TODO: Enable unsigned journey select
  const setSelectedJourney = action("Set selected journey", (journeyItem = null) => {
    if (
      journeyItem &&
      typeof journeyItem.journeyType !== "undefined" &&
      journeyItem.journeyType !== "journey"
    ) {
      // Prevents the app from crashing if accidentally selecting an unsigned journey
      // before they are implemented.
      return;
    }

    if (!journeyItem) {
      state.selectedJourney = null;
      setPathName("/");
    } else if (journeyItem) {
      const oldVehicle = get(state, "vehicle", "");
      state.selectedJourney = getJourneyObject(journeyItem);
      filters.setRoute(journeyItem);

      if (journeyItem.uniqueVehicleId !== oldVehicle) {
        filters.setVehicle(journeyItem.uniqueVehicleId);
      }

      time.toggleLive(false);
      setPathName(createJourneyPath(journeyItem));
    }
  });

  const setJourneyVehicle = action((vehicleId) => {
    const {selectedJourney} = state;

    if (vehicleId && selectedJourney && !selectedJourney.uniqueVehicleId) {
      selectedJourney.uniqueVehicleId = vehicleId;
      setPathName(createJourneyPath(selectedJourney));
    }
  });

  const setJourneyEventFilter = action((events, init = false) => {
    if (Object.keys(state.journeyEvents).length === 0 && init) {
      // Init the filter state with events from the component if the filterState is empty.
      state.journeyEvents = events;
    } else if (init) {
      // If a new init comes in when we have filter state, add any possible new filter items
      // to the state by merging. Merge the current state last to retain the current state.
      state.journeyEvents = merge({}, events, state.journeyEvents);
    } else if (!init) {
      if (typeof events.ALL !== "undefined") {
        // Set all filters to the value of events.ALL if present
        Object.keys(state.journeyEvents).map((key) => {
          // Set the default configuration if deselecting ALL. For others, set the value of ALL.
          const setValue =
            !events.ALL &&
            ["DEPARTURE", "PLANNED", "TIMING_STOP_ARS", "TERMINAL_ARS"].includes(key)
              ? true
              : events.ALL;

          state.journeyEvents[key] = setValue;
        });
      } else {
        // Set the new filter state from the 'events' argument.
        Object.keys(events).map((key) => (state.journeyEvents[key] = events[key]));

        // If some filters are turned off, also set the all switch to off. Either set it to on.
        state.journeyEvents.ALL = !Object.values(state.journeyEvents).some(
          (val) => val === false
        );
      }
    }
  });

  return {
    setSelectedJourney,
    setJourneyVehicle,
    setJourneyEventFilter,
  };
};
