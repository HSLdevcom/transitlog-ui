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
  cursor: ${(p) => (p.isActive ? "pointer" : "default")};
  outline: none;
  text-align: left;
  width: auto;

  > * {
    transition: all 0.1s ease-out;
  }

  &:hover > * {
    transform: ${(p) => (p.isActive ? "scale(1.025)" : "none")};
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
    <ToggleViewWrapper className={className}>
      <ToggleButton isActive={!isDisabled} onClick={onClickLabel}>
        {typeof label === "function" ? label(open) : label}
      </ToggleButton>
      {!isDisabled && open ? children : null}
    </ToggleViewWrapper>
  );
};

export default ToggleView;
