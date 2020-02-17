import React, {useCallback} from "react";
import {Button} from "./Forms";
import styled from "styled-components";

const GroupButton = styled(Button)`
  padding: 0 1rem;
  background: ${({isActive = false}) => (isActive ? "var(--blue)" : "white")};
  color: ${({isActive = false}) => (isActive ? "white" : "var(--blue)")};
  border-radius: 0;
  border: 0;
  border-left: 1px solid var(--blue);
  border-right: 1px solid var(--blue);
  margin-left: -1px;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;

  &:first-child {
    border-left: 0;
  }

  &:last-child {
    border-right: 0;
  }

  &:hover {
    background: ${({isActive = false}) =>
      isActive ? "var(--blue)" : "var(--lightest-grey)"};
    color: ${({isActive = false}) => (isActive ? "white" : "var(--blue)")};
  }
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border: 2px solid var(--blue);
  border-radius: 10px;
  overflow: hidden;
`;

const ButtonGroup = React.forwardRef((props, ref) => {
  const {className, buttons = []} = props;
  const defaultOnClick = useCallback(
    (btn) => () => {
      console.log(btn);
    },
    []
  );

  if (buttons.length === 0) {
    return null;
  }

  return (
    <Wrapper className={className} ref={ref}>
      {buttons.map((btn, index, {length}) => (
        <GroupButton
          key={btn.key}
          isFirst={index === 0}
          isLast={index === length - 1}
          small
          primary
          isActive={btn.active}
          onClick={btn.onClick || defaultOnClick(btn)}
          helpText={btn.helpText}>
          {btn.label}
        </GroupButton>
      ))}
    </Wrapper>
  );
});

export default ButtonGroup;
