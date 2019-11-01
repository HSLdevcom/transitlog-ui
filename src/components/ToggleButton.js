import React from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import {useTooltip} from "../hooks/useTooltip";

const Container = styled.label`
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  position: relative;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
`;

export const ToggleInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
`;

export const ToggleMarker = styled.div`
  position: absolute;
  top: 1px;
  left: 0;
  width: 16px;
  height: 16px;
  background-color: ${({checked, inverted}) =>
    inverted && checked
      ? "var(--blue)"
      : inverted && !checked
      ? "white"
      : !inverted && !checked
      ? "#aaa"
      : "white"};
  border: 1px solid ${({checked}) => (!checked ? "transparent" : "var(--blue)")};
  border-radius: 15px;
  transition: transform 0.1s ease-out;
  transform: translate(2px, 0);
`;

export const ToggleContainer = styled.div`
  position: relative;
  width: 35px;
  height: 20px;
  border: 1px solid
    ${({isSwitch, inverted}) =>
      inverted ? "white" : isSwitch ? "var(--blue)" : "var(--grey)"};
  background: ${({isSwitch, inverted}) =>
    isSwitch || inverted ? "var(--blue)" : "white"};
  border-radius: 15px;
  transition: background 0.2s ease-out;
  flex: 0 0 35px;

  ${ToggleInput}:checked + & {
    background: ${({inverted}) => (!inverted ? "var(--blue)" : "white")};
    border-color: ${({inverted}) => (!inverted ? "var(--blue)" : "white")};

    ${ToggleMarker} {
      transform: translate(16px, 0);
    }
  }
`;

const TextContainer = styled.div`
  font-family: var(--font-family);
  flex: 1 1 40%;
  justify-content: flex-start;
  align-items: flex-start;
  color: ${({disabled}) => (disabled ? "var(--light-grey)" : "inherit")};
  margin-left: ${({isPreLabel = false}) => (isPreLabel ? "0" : "0.5rem")};
  margin-right: ${({isPreLabel = false}) => (isPreLabel ? "0.5rem" : "0")};
  text-align: ${({isPreLabel = false}) => (isPreLabel ? "right" : "left")};
  font-size: 0.75rem;
  white-space: nowrap;
`;

const ToggleButton = observer(
  ({
    type = "radio",
    checked,
    name,
    onChange,
    value,
    disabled,
    isSwitch = false,
    children,
    label = children,
    preLabel,
    className,
    helpText,
    inverted = false,
    testId = "toggle-button",
  }) => (
    <Container data-testid={testId} {...useTooltip(helpText)} className={className}>
      {preLabel && <TextContainer isPreLabel={true}>{preLabel}</TextContainer>}
      <ToggleInput
        type={type}
        name={name}
        onChange={onChange}
        value={value}
        disabled={disabled}
        checked={checked}
      />
      <ToggleContainer
        isSwitch={isSwitch}
        checked={checked}
        disabled={disabled}
        inverted={inverted}>
        <ToggleMarker
          checked={!checked ? isSwitch : checked}
          disabled={disabled}
          inverted={inverted}
        />
      </ToggleContainer>
      <TextContainer>{label}</TextContainer>
    </Container>
  )
);
export default ToggleButton;
