import React from "react";
import {observer} from "mobx-react-lite";
import styled, {css} from "styled-components";

const SliderThumb = css`
  height: 20px;
  width: 79px;
  margin-top: -10px;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.15s ease-out, transform 0.2s ease-out;
  padding: 0;
  box-sizing: border-box;
`;

const SliderTrack = css`
  width: 100%;
  height: 3px;
  padding: 1rem 0;
  box-sizing: content-box;
  cursor: pointer;
  background: var(--blue);
  background-clip: content-box;
`;

const Slider = styled.input.attrs({type: "range", step: 1})`
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  height: 35px;
  background: transparent;
  display: block;
  margin: 0;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    ${SliderThumb};
  }

  &::-webkit-slider-runnable-track {
    ${SliderTrack};
  }

  &::-moz-range-track {
    ${SliderTrack};
  }

  &::-ms-track {
    ${SliderTrack};
  }

  &::-moz-range-thumb {
    ${SliderThumb};
  }

  &::-ms-thumb {
    ${SliderThumb};
  }

  &:focus {
    outline: none;
  }

  &::-ms-track {
    width: 100%;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
`;

const RangeInput = observer(({innerRef, title, value, onChange, min, max, className}) => {
  const safeVal = !value || isNaN(value) ? 0 : value;

  return (
    <Slider
      ref={innerRef}
      title={title}
      className={className}
      min={min}
      max={max}
      value={safeVal}
      onChange={onChange}
    />
  );
});

export default RangeInput;
