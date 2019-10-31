import React from "react";
import {observer} from "mobx-react";
import styled, {css} from "styled-components";
import {InputBase, InputLabel} from "./Forms";
import {flow} from "lodash";

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  position: relative;
  margin-right: 0.75rem;

  &:only-child {
    margin-right: 0;
  }

  > *:not(label) {
    transition: margin-top 0.15s ease-out;
    ${({animatedLabel}) => (animatedLabel ? "margin-top: 1.25rem" : "")};

    &:placeholder-shown,
    &.empty-select {
      margin-top: 0;
    }
  }
`;

const Label = styled(InputLabel)`
  white-space: nowrap;
  ${({animated = true}) =>
    animated
      ? css`
          position: absolute;
          top: 0;
          left: 0.2rem;
          transform: translate(0);
          transition: transform 0.1s ease-out;
          pointer-events: none;
          margin-bottom: 0;

          *:placeholder-shown + &,
          .empty-select + & {
            transform: translate(0.5rem, 0.45rem);
            text-transform: none;
            font-weight: 300;
            color: var(--light-grey);
          }
        `
      : ""};
`;

const decorate = flow(observer);

const Input = decorate(
  ({
    labelTestId = "input-label",
    label,
    children,
    className,
    animatedLabel = true,
    ...props
  }) => {
    const inputComponent = !children ? (
      <InputBase placeholder=" " {...props} />
    ) : (
      children
    );

    return (
      <InputWrapper animatedLabel={animatedLabel} className={className}>
        {label && !animatedLabel && (
          <Label data-testid={labelTestId} animated={false}>
            {label}
          </Label>
        )}
        {inputComponent}
        {label && animatedLabel && <Label animated={true}>{label}</Label>}
      </InputWrapper>
    );
  }
);

export default Input;
