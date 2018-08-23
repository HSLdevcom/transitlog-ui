import {action} from "mobx";

const timeActions = (state) => {
  const setTime = action((timeValue) => (state.time = timeValue));

  const setTimeIncrement = action(
    (timeIncrementValue) => (state.timeIncrement = timeIncrementValue)
  );

  return {
    setTime,
    setTimeIncrement,
  };
};

export default timeActions;
