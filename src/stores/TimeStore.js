import {extendObservable, set} from "mobx";
import timeActions from "./timeActions";
import {getMomentFromDateTime, timeToTimeObject} from "../helpers/time";
import get from "lodash/get";
import moment from "moment-timezone";
import {getUrlValue, onHistoryChange} from "./UrlManager";
import {setResetListener} from "./FilterStore";
import {TIMEZONE} from "../constants";

export default (state, initialState) => {
  extendObservable(state, {
    live: getUrlValue("live", false),
    time: get(initialState, "time", moment.tz(new Date(), TIMEZONE).format("HH:mm:ss")),
    get dateMoment() {
      const {date} = state;
      return getMomentFromDateTime(date);
    },
    get timeMoment() {
      const {time, dateMoment} = state;
      return dateMoment.clone().set(timeToTimeObject(time));
    },
    get unixTime() {
      const {timeMoment} = state;
      return timeMoment.unix();
    },
    get timeIsCurrent() {
      const {unixTime} = state;
      const now = Math.floor(Date.now() / 1000);
      const checkTime = unixTime + 5 * 60;
      return now < checkTime;
    },
    get isLiveAndCurrent() {
      const {live, timeIsCurrent} = state;
      return live && timeIsCurrent;
    },
    timeIncrement: parseInt(get(initialState, "time_increment", "5"), 10),
    areaSearchRangeMinutes: parseInt(get(initialState, "area_search_minutes", 60), 10),
  });

  const actions = timeActions(state);

  setResetListener(() => actions.toggleLive(false));

  onHistoryChange((urlState) => {
    set(state, {
      live: urlState.live || false,
      time: get(urlState, "time", state.time),
      timeIncrement: parseInt(get(urlState, "time_increment", state.timeIncrement), 10),
      areaSearchRangeMinutes: parseInt(
        get(urlState, "area_search_minutes", state.timeIncrement),
        10
      ),
    });
  });

  return actions;
};
