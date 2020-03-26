import styled, {css, createGlobalStyle} from "styled-components";
import React from "react";
import {useTooltip, applyTooltip} from "../hooks/useTooltip";
import CrossThick from "../icons/CrossThick";

export const GlobalFormStyle = createGlobalStyle`
  select,
  input:not([type="radio"]):not([type="checkbox"]),
  button,
  textarea {
    width: 100%;
  }
`;

const INPUT_HEIGHT = "2rem";

export const ControlGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  width: 100%;
  margin: 0 0 0.33rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const InputLabel = styled.label`
  font-family: var(--font-family);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 129%;
  letter-spacing: 0;
  margin-bottom: 0.5rem;
  color: var(--grey);
  text-transform: uppercase;
  user-select: none;
`;

export const InputStyles = css`
  font-family: var(--font-family);
  padding: 0.25rem 0.7rem;
  border-radius: 0.25rem;
  border: 1px solid var(--alt-grey);
  outline: none;
  font-size: 0.875rem;
  height: ${INPUT_HEIGHT};
  background-color: white;

  &:focus {
    border-color: var(--blue);
  }

  &:disabled {
    background: var(--lighter-grey);
    color: var(--dark-grey);
  }
`;

export const StyledInputBase = styled.input`
  ${InputStyles}
`;

export const InputBase = React.forwardRef(({helpText, children, ...props}, ref) => (
  <StyledInputBase {...props} {...applyTooltip(helpText)} ref={ref} />
));

export const StyledButton = styled.button`
  font-family: var(--font-family);
  font-size: ${({small = false}) => (small ? "0.75rem" : "1rem")};
  font-weight: 500;
  appearance: none;
  outline: none;
  border-radius: 2.5rem;
  border: 1px solid ${({transparent = false}) => (!transparent ? "var(--blue)" : "white")};
  background: ${({primary = false, transparent = false}) =>
    primary ? "var(--blue)" : transparent ? "transparent" : "white"};
  letter-spacing: -0.6px;
  padding: 0 ${({small = false}) => (small ? "1.25rem" : "1.65em")};
  color: ${({primary = false, transparent = false}) =>
    primary || transparent ? "white" : "var(--blue)"};
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  flex: 0 0 auto;
  height: ${({small = false}) => (small ? "1.75rem" : "2.5rem")};
  cursor: pointer;
  transform: scale(1) translateZ(0);
  transition: background-color 0.2s ease-out, transform 0.1s ease-out;

  &:hover {
    background: ${({primary = false, transparent}) =>
      primary || transparent ? "var(--dark-blue)" : "#eeeeee"};
    transform: scale(1.025);
  }
`;

export const Button = React.forwardRef(({helpText, ...props}, ref) => (
  <StyledButton {...props} {...useTooltip(helpText)} ref={ref} />
));

export const ClearButton = styled(Button).attrs({
  primary: true,
  children: <CrossThick fill="white" width="0.75rem" height="0.75rem" />,
})`
  padding: 0.25rem 0.7rem;
  border-radius: 0.25rem;
  outline: none;
  font-size: 0.875rem;
  height: ${INPUT_HEIGHT};
  background-color: var(--light-grey);
  border: 0;

  &:hover {
    background: var(--red);
  }
`;

// Custom checkbox
const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
`;
const HiddenCheckbox = styled.input.attrs({type: "checkbox"})`
  // Hide checkbox visually but remain accessible to screen readers.
  // Source: https://polished.js.org/docs/#hidevisually
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;
const Icon = styled.svg`
  fill: none;
  stroke: black;
  stroke-width: 3px;
`;
const StyledCheckbox = styled.div`
  display: inline-block;
  width: ${(props) => (props.size ? props.size : "16")}px;
  height: ${(props) => (props.size ? props.size : "16")}px;
  border-radius: 3px;
  border: 2px solid var(--blue);
  cursor: pointer;
  ${Icon} {
    visibility: ${(props) => (props.checked ? "visible" : "hidden")};
  }
`;
export const Checkbox = ({checked, onChange, size}) => (
  <div>
    <label>
      <CheckboxContainer>
        <HiddenCheckbox checked={checked} onChange={onChange} />
        <StyledCheckbox checked={checked} size={size}>
          <Icon viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </Icon>
        </StyledCheckbox>
      </CheckboxContainer>
    </label>
  </div>
);
