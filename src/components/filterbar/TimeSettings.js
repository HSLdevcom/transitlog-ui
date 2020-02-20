import React, {useState, useCallback, useEffect, useRef, useMemo} from "react";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import {observer} from "mobx-react-lite";
import {timeToSeconds, getValidTimeWithinRange} from "../../helpers/time";
import {InputBase, ControlGroup} from "../Forms";
import PlusMinusInput from "../PlusMinusInput";
import styled from "styled-components";
import doubleDigit from "../../helpers/doubleDigit";
import {setResetListener} from "../../stores/FilterStore";

const TimeControlGroup = styled(ControlGroup)`
  margin-bottom: 1.25rem;
`;

const TimeInput = styled(InputBase)`
  text-align: center;
  border-color: var(--blue);
  display: block;
  height: calc(2rem + 2px);
`;

const decorate = flow(observer, inject("Time"));

const TimeSettings = decorate(({journeys, state, Time}) => {
  const {time, live, timeIncrement} = state;

  const [timeInput, setTimeInput] = useState("0");
  const [isDirty, setDirty] = useState(false);

  const displayTime = useMemo(() => {
    return isDirty ? timeInput : time;
  }, [isDirty, timeInput, time]);

  const onSetTime = useCallback(
    (timeVal) => {
      const timeInRange = getValidTimeWithinRange(timeVal, journeys);
      Time.toggleLive(false);
      Time.setTime(timeInRange);
    },
    [journeys, Time]
  );

  const onTimeButtonClick = useCallback(
    (modifier) => () => {
      const currentTime = timeToSeconds(time);
      const nextTime = currentTime + modifier;

      if (nextTime >= 0) {
        onSetTime(nextTime);
      }
    },
    [time]
  );

  const setTimeValue = useCallback((value, dirtyVal = true) => {
    setTimeInput(value || "");
    setDirty(dirtyVal);
  }, []);

  const onKeyDown = useCallback((e) => {
    // Blur the input if enter (13) or esc (27) is pressed.
    if (e.keyCode === 27 || e.keyCode === 13) {
      e.target.blur();
    }
  }, []);

  const onFocus = useCallback(() => {
    if (live) {
      Time.toggleLive(false);
    }
  }, [live]);

  const onBlur = useCallback(() => {
    if (!isDirty) {
      return false;
    }

    // Get the current input value and remove non-number characters.
    const timeValue = timeInput.replace(/([^0-9])+/g, "");

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    // Get the time string pieces and trim (although that shouldn't be necessary after the regexp).
    // Default to "00".
    if (timeValue.length === 1) {
      hours = Math.max(0, parseInt(timeValue, 10));
    } else if (timeValue.length <= 3) {
      hours = Math.min(30, Math.max(0, parseInt(timeValue.slice(0, 1) || "0", 10)));
      minutes = Math.max(0, parseInt(timeValue.slice(1, 3) || "00", 10));
    } else {
      hours = Math.max(0, parseInt(timeValue.slice(0, 2) || "00", 10));
      minutes = Math.max(0, parseInt(timeValue.slice(2, 4) || "00", 10));
      seconds = Math.max(0, parseInt(timeValue.slice(4, 6) || "00", 10));
    }

    // Pad the string with a zero at the end IF the string is one character long.
    function padStart(val) {
      return val.length < 2 ? doubleDigit(val, true) : val;
    }

    // Get 24h+ times of the hours are under 4:30.
    if (hours >= 0 && (hours < 4 || (hours === 4 && minutes < 30))) {
      hours = Math.min(28, 24 + hours);
    }

    // Sanity check minutes.
    if (minutes > 59) {
      minutes = 59;
    }

    // Sanity check seconds.
    if (minutes > 59) {
      seconds = 59;
    }

    // Make it into a valid time string
    const nextTimeVal = `${doubleDigit(padStart(hours))}:${doubleDigit(
      padStart(minutes)
    )}:${doubleDigit(padStart(seconds))}`;

    // Assign it to the state for stuff to happen
    onSetTime(nextTimeVal);
    // Clear the local state and set it as not dirty to show the state value in the input.
    setTimeValue("", false);
  });

  useEffect(() => {
    return setResetListener(() => {
      setTimeValue("", false);
    });
  }, []);

  return (
    <TimeControlGroup>
      <PlusMinusInput
        testIdPrefix="time-setting"
        minusHelp="One time step backward"
        plusHelp="One time step forward"
        onIncrease={onTimeButtonClick(timeIncrement)}
        onDecrease={onTimeButtonClick(-timeIncrement)}>
        <TimeInput
          data-testid="time-input"
          type="text"
          helpText="Select time"
          value={displayTime}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          onChange={(e) => setTimeValue(e.target.value, true)}
        />
      </PlusMinusInput>
    </TimeControlGroup>
  );
});

export default TimeSettings;
