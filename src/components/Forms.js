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
    transform: scale(1.05) translateZ(10px);
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
