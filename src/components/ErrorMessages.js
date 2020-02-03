import React from "react";
import flow from "lodash/flow";
import get from "lodash/get";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import styled from "styled-components";
import {Button} from "./Forms";

const ErrorsWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 10;
`;

const Error = styled.div`
  padding: 0.33rem 1rem;
  background: var(--red);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  line-height: 1;
  border-top: 1px solid #a72828;
`;

const DismissButton = styled(Button).attrs(() => ({small: true, primary: false}))`
  border: 1px solid white;
  color: white;
  background: transparent;
  padding: 0.25rem 1rem;
  font-size: 0.75rem;

  &:hover {
    background: transparent;
  }
`;

const decorate = flow(observer, inject(app("UI")));

export default decorate(function ErrorMessages({state, UI}) {
  const {errors} = state;

  return (
    <ErrorsWrapper visible={errors.length !== 0}>
      {errors.map((error) => {
        let msg = get(error, "message", "");

        if (typeof msg !== "string") {
          msg = JSON.stringify(msg);
        }

        return (
          <Error key={`error_${error.id}`}>
            <span>
              {error.type} error: {msg}
            </span>
            <DismissButton onClick={() => UI.removeError(get(error, "id", null))}>
              Dismiss
            </DismissButton>
          </Error>
        );
      })}
    </ErrorsWrapper>
  );
});
