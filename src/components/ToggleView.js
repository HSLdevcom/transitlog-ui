import React, {useCallback} from "react";
import styled from "styled-components";
import {useToggle} from "../hooks/useToggle";

const ToggleViewWrapper = styled.div``;

const ToggleButton = styled.button`
  display: block;
  padding: 0;
  background: transparent;
  border: 0;
  font-family: inherit;
  text-decoration: underline dashed;
  color: var(--blue);
  cursor: pointer;
  outline: none;
  text-align: left;
  width: auto;

  > * {
    transition: all 0.1s ease-out;
  }

  &:hover > * {
    transform: scale(1.025);
  }
`;

const ToggleView = ({children, className, label = "Toggle", disabled = false}) => {
  const isDisabled = !!disabled || !children;
  const [open, toggleOpen] = useToggle(false);

  const onClickLabel = useCallback(() => {
    if (!isDisabled) {
      toggleOpen();
    }
  }, [isDisabled]);

  return (
    <ToggleViewWrapper isActive={!isDisabled} className={className}>
      <ToggleButton onClick={onClickLabel}>
        {typeof label === "function" ? label(open) : label}
      </ToggleButton>
      {!isDisabled && open ? children : null}
    </ToggleViewWrapper>
  );
};

export default ToggleView;
