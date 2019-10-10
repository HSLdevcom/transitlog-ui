import {action} from "mobx";
import {setUrlValue} from "./UrlManager";
import debounce from "lodash/debounce";
import doubleDigit from "../helpers/doubleDigit";
import {secondsToTimeObject} from "../helpers/time";
import {intval} from "../helpers/isWithinRange";

const timeActions = (state) => {
  // Time might update frequently, so make sure that setting it
  // in the url doesn't slow down the app.
  const setUrlTime = debounce((time) => setUrlValue("time", time), 1000);

  const setTime = action("Set time", (timeValue) => {
    state.time = timeValue;
    setUrlTime(state.time);
  });

  const setSeconds = (setValue = 0) => {
    const {hours, minutes, seconds} = secondsToTimeObject(setValue);
    setTime(`${doubleDigit(hours)}:${doubleDigit(minutes)}:${doubleDigit(seconds)}`);
  };

  const setTimeIncrement = action("Set time increment", (timeIncrementValue = 0) => {
    state.timeIncrement = Math.max(Math.min(intval(timeIncrementValue || 0), 60 * 60), 1);
    setUrlValue("time_increment", state.timeIncrement);
  });

  const setAreaSearchMinutes = action("Set area search minutes", (searchValue = 60) => {
    const intValue = !searchValue ? 0 : parseInt(searchValue, 10);
    const notNan = isNaN(intValue) ? 5 : intValue;

    state.areaSearchRangeMinutes = Math.max(Math.min(notNan, 60 * 12), 5);
    setUrlValue("area_search_minutes", state.areaSearchRangeMinutes);
  });

  const toggleLive = action("Toggle live", (setTo = !state.live) => {
    state.live = setTo;
    setUrlValue("live", state.live);
  });

  return {
    setTime,
    setSeconds,
    setTimeIncrement,
    setAreaSearchMinutes,
    toggleLive,
  };
};

export default timeActions;
