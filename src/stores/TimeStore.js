import {extendObservable, reaction, action} from "mobx";
import moment from "moment";
import timer from "../helpers/timer";

let timerHandle = null;

export default (state) => {
  extendObservable(state, {
    time: "12:30:00",
    playing: false,
    timeIncrement: 5,
  });

  const setTime = action((timeValue) => (state.time = timeValue));
  const setTimeIncrement = action(
    (timeIncrementValue) => (state.timeIncrement = timeIncrementValue)
  );

  const onAutoplayIteration = () => {
    const nextTimeValue = moment(state.time, "HH:mm:ss")
      .add(state.timeIncrement, "seconds")
      .format("HH:mm:ss");

    setTime(nextTimeValue);
  };

  const toggleAutoplay = action(() => {
    state.playing = !state.playing;
  });

  reaction(
    () => state.playing,
    (isPlaying) => {
      if (isPlaying && !timerHandle) {
        // timer() is a setInterval alternative that uses requestAnimationFrame.
        // This makes it more performant and can "pause" when the tab is not focused.
        timerHandle = timer(() => onAutoplayIteration(), 1000);
      } else if (!isPlaying && !!timerHandle) {
        cancelAnimationFrame(timerHandle.value);
        timerHandle = null;
      }
    }
  );

  return {
    setTime,
    setTimeIncrement,
    toggleAutoplay,
  };
};
