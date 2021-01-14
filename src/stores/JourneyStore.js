import {extendObservable, action, reaction, runInAction, toJS} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import FilterActions from "./filterActions";
import TimeActions from "./timeActions";
import moment from "moment-timezone";
import journeyActions from "./journeyActions";
import {getJourneyObject} from "../helpers/getJourneyObject";
import {getPathName, getUrlValue, onHistoryChange} from "./UrlManager";
import get from "lodash/get";
import {setResetListener} from "./FilterStore";
import {getTimeString} from "../helpers/time";
import {TIMEZONE} from "../constants";
import {intval} from "../helpers/isWithinRange";

export default (state) => {
  extendObservable(state, {
    selectedJourney: null,
    journeyEventFilters: getUrlValue("journeyEventFilters", "")
      .split(",")
      .reduce((enabledEvents, key) => {
        if (!key) {
          return enabledEvents;
        }

        enabledEvents[key] = true;
        return enabledEvents;
      }, {}),
  });

  const filterActions = FilterActions(state);
  const timeActions = TimeActions(state);
  const actions = journeyActions(state);

  const selectJourneyFromUrl = action((pathname) => {
    let [
      // The first two array elements are an empty string and the word "journey".
      // eslint-disable-next-line no-unused-vars
      _,
      basePath,
      departureDate,
      departureTime,
      routeId,
      direction,
      uniqueVehicleId,
    ] = pathname.split("/");

    direction = intval(direction);

    if (basePath === "journey") {
      const date = moment.tz(departureDate, "YYYYMMDD", TIMEZONE);

      let dateStr = "";
      let timeStr = "";
      let vehicleId = uniqueVehicleId || getUrlValue("vehicle", "") || "";

      if (vehicleId) {
        vehicleId = vehicleId.replace("_", "/");
      }

      if (date.isValid()) {
        dateStr = date.format("YYYY-MM-DD");
        filterActions.setDate(dateStr);
      }

      if (departureTime) {
        // Split the time into hours/minutes/seconds and create a valid time string.
        timeStr = getTimeString(...departureTime.match(/.{1,2}/g));

        if (timeStr && !getUrlValue("time", null)) {
          timeActions.setTime(timeStr);
        }
      }

      if (routeId && direction) {
        routeId = routeId.replace("+", " ").replace("%20", " ");
        filterActions.setRoute({routeId: routeId, direction: direction});
      }

      // Validate the data from the url
      if (dateStr && timeStr && routeId && direction) {
        const journey = getJourneyObject({
          departureDate: dateStr,
          routeId,
          direction,
          departureTime: timeStr,
          uniqueVehicleId: vehicleId || "",
        });

        if (getJourneyId(state.selectedJourney, false) !== getJourneyId(journey, false)) {
          actions.setSelectedJourney(journey);
        }
      }
    }
  });

  selectJourneyFromUrl(getPathName());

  // If a journey is selected, sync the day of the selected journey when the
  // selected date changes.
  reaction(
    () => state.date,
    (currentDate) => {
      const currentlySelectedJourney = state.selectedJourney;

      // No action if there is not a selected journey
      if (!currentlySelectedJourney) {
        return;
      }

      const journeyDate = get(currentlySelectedJourney, "departureDate", "");

      if (journeyDate !== currentDate) {
        runInAction(() => {
          const nextJourney = toJS(state.selectedJourney);
          nextJourney.departureDate = currentDate;
          nextJourney.uniqueVehicleId = "";

          state.selectedJourney = nextJourney;
        });
      }
    }
  );

  setResetListener(() => actions.setSelectedJourney(null));

  onHistoryChange(() => {
    selectJourneyFromUrl(getPathName());
  });

  return {
    ...actions,
  };
};
