import {reaction} from "mobx";
import moment from "moment-timezone";
import set from "lodash/set";
import unset from "lodash/unset";
import timer from "../helpers/timer";
import TimeActions from "./timeActions";
import {timeToSeconds, secondsToTime} from "../helpers/time";
import {TIMEZONE} from "../constants";

const updateListeners = {};
let pollingStart = 0;

// Add update callbacks by name to enable overwriting the callback with
// a new instance without needing to remove the previous one.
// Pass false as the third arg to prevent this from running when auto-updating.
export function setUpdateListener(name, cb, auto = true) {
  set(updateListeners, name, {auto, cb});
  return () => removeUpdateListener(name);
}

export function removeUpdateListener(name) {
  return unset(updateListeners, name);
}

let updateTimerHandle = null;

export default (state) => {
  const timeActions = TimeActions(state);

  const updateTime = () => {
    const {time, live, timeIncrement, timeIsCurrent} = state;

    if (live && !timeIsCurrent) {
      const currentTime = timeToSeconds(time);
      const nextTime = currentTime + timeIncrement;
      timeActions.setTime(secondsToTime(Math.max(0, nextTime)));
    } else if (live && timeIsCurrent) {
      // Live-updating is impossible for 24h+ journeys, as the date will
      // just be the current, real date.
      const nowMoment = moment.tz(new Date(), TIMEZONE);
      timeActions.setTime(nowMoment.format("HH:mm:ss"));
    }
  };

  const update = (isAuto = false) => {
    if (!isAuto) {
      timeActions.toggleLive(false);
    }

    updateTime();

    if (!isAuto || (isAuto && state.timeIsCurrent)) {
      Object.values(updateListeners).forEach(({auto, cb}) => {
        // Check that the cb should run when auto-updating if this is an auto-update.
        if (typeof cb === "function" && (!isAuto || (isAuto && auto))) {
          cb(isAuto);
        }
      });
    }
  };

  function cancelTimer() {
    cancelAnimationFrame(updateTimerHandle.value);
    updateTimerHandle = null;
  }

  reaction(
    () => [state.live, state.timeIsCurrent],
    ([isPolling]) => {
      if (updateTimerHandle) {
        cancelTimer();
      }

      if (isPolling) {
        pollingStart = Date.now();
        // timer() is a setInterval alternative that uses requestAnimationFrame.
        // This makes it more performant and can "pause" when the tab is not focused.
        updateTimerHandle = timer(() => {
          if (Date.now() - pollingStart > 5000 * 60) {
            timeActions.toggleLive(false);
          }

          update(true);
        }, 1000);
      }
    },
    {fireImmediately: true, delay: 100, name: "Auto-update time reaction"}
  );

  return {
    update,
  };
};
