import React, {Component} from "react";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import {timeToSeconds, getValidTimeWithinRange} from "../../helpers/time";
import {InputBase, ControlGroup} from "../Forms";
import PlusMinusInput from "../PlusMinusInput";
import styled from "styled-components";
import doubleDigit from "../../helpers/doubleDigit";
import {observable, action, computed} from "mobx";
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

@inject(app("Time"))
@observer
class TimeSettings extends Component {
  resetListener = () => {};

  @observable
  timeInput = "0";

  // It is necessary to have a separate "dirty" state. If we would consider the input
  // dirty when the timeInput string is empty, the input value would just switch back
  // to the state value which is disorienting if you're clearing the field and
  // trying to write a new value.
  @observable
  isDirty = false;

  @computed
  get displayTime() {
    const {
      state: {time},
    } = this.props;

    // Display either the state value or the local value in the input.
    return this.isDirty ? this.timeInput : time;
  }

  componentDidMount() {
    // Reset the local input state when the app is reset
    this.resetListener = setResetListener(() => {
      this.setTimeValue("", false);
    });
  }

  componentWillUnmount() {
    this.resetListener();
  }

  onTimeButtonClick = (modifier) => () => {
    const {
      state: {time},
    } = this.props;

    const currentTime = timeToSeconds(time);
    const nextTime = currentTime + modifier;

    if (nextTime >= 0) {
      this.onSetTime(nextTime);
    }
  };

  setTimeValue = action((value, dirtyVal = true) => {
    this.timeInput = value || "";
    this.isDirty = dirtyVal;
  });

  onKeyDown = (e) => {
    // Blur the input if enter (13) or esc (27) is pressed.
    if (e.keyCode === 27 || e.keyCode === 13) {
      e.target.blur();
    }
  };

  onFocus = () => {
    const {Time, state} = this.props;

    if (state.live) {
      Time.toggleLive(false);
    }
  };

  onBlur = () => {
    if (!this.isDirty) {
      return false;
    }

    // Get the current input value and remove non-number characters.
    const timeValue = this.timeInput.replace(/([^0-9])+/g, "");

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
    this.onSetTime(nextTimeVal);
    // Clear the local state and set it as not dirty to show the state value in the input.
    this.setTimeValue("", false);
  };

  onSetTime = (timeVal) => {
    const {journeys = [], Time} = this.props;
    const timeInRange = getValidTimeWithinRange(timeVal, journeys);

    Time.toggleLive(false);
    Time.setTime(timeInRange);
  };

  render() {
    const {state} = this.props;
    const {timeIncrement} = state;

    return (
      <TimeControlGroup>
        <PlusMinusInput
          testIdPrefix="time-setting"
          minusHelp="One time step backward"
          plusHelp="One time step forward"
          onIncrease={this.onTimeButtonClick(timeIncrement)}
          onDecrease={this.onTimeButtonClick(-timeIncrement)}>
          <TimeInput
            data-testid="time-input"
            type="text"
            helpText="Select time"
            value={this.displayTime}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onKeyDown={this.onKeyDown}
            onChange={(e) => this.setTimeValue(e.target.value, true)}
          />
        </PlusMinusInput>
      </TimeControlGroup>
    );
  }
}

export default TimeSettings;
