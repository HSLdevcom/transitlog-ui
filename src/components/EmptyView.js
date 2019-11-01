import React from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../helpers/inject";
import styled from "styled-components";
import SomethingWrong from "../icons/SomethingWrong";
import Alert from "../icons/Alert";
import SignIn from "../icons/SignIn";
import NoConnection from "../icons/NoConnection";
import {Text} from "../helpers/text";

const decorate = flow(
  observer,
  inject("UI")
);

const EmptyViewWrapper = styled.div`
  padding: 1rem;
  margin: 1rem;
  border-radius: 10px;
  border: 1px solid var(--alt-grey);
  text-align: center;

  svg {
    display: block;
    margin: 0.75rem auto 1.75rem;
  }
`;

const ErrorMessage = styled.li`
  color: var(--grey);
  font-size: 0.875rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ErrorList = styled.ul`
  padding: 0 0 0 1rem;
`;

const MessagesHeading = styled.p`
  color: var(--grey);
  font-size: 0.875rem;
  font-weight: bold;
  margin-top: 1.75rem;
`;

const emptyReasons = {
  NETWORK: "network",
  UNKNOWN: "unknown",
  NODATA: "no-data",
  AUTHENTICATION: "authentication",
};

const EmptyView = decorate(({error = null, text, icon}) => {
  const messages = [];
  let emptyReason = "";
  const UseIcon = icon || SomethingWrong;

  if (error) {
    if (error.networkError) {
      messages.push(error.networkError.message);
      emptyReason = emptyReasons.NETWORK;
    }

    if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
      for (const err of error.graphQLErrors) {
        messages.push(err.message);
      }

      emptyReason = error.graphQLErrors.some(
        (err) => err.extensions.code === "UNAUTHENTICATED"
      )
        ? emptyReasons.AUTHENTICATION
        : emptyReasons.UNKNOWN;
    }

    if (error.emptyDataError) {
      messages.push(error.emptyDataError.message);
      emptyReason = emptyReasons.NODATA;
    }
  }

  return (
    <EmptyViewWrapper data-testid={`empty-view empty-view-${emptyReason}`}>
      {text && !error ? (
        <>
          <UseIcon fill="var(--light-grey)" height="5rem" width="5rem" />
          <p>
            <Text>{text}</Text>
          </p>
        </>
      ) : emptyReason === emptyReasons.NETWORK ? (
        <>
          <NoConnection fill="var(--alt-grey)" height="5rem" width="5rem" />
          <p>
            <Text>message.emptyview.network</Text>
          </p>
        </>
      ) : emptyReason === emptyReasons.AUTHENTICATION ? (
        <>
          <SignIn fill="var(--alt-grey)" height="5rem" width="5rem" />
          <p>
            <Text>message.emptyview.authentication</Text>
          </p>
        </>
      ) : emptyReason === emptyReasons.NODATA ? (
        <>
          <Alert fill="var(--alt-grey)" height="5rem" width="5rem" />
          <p>
            <Text>message.emptyview.nodata</Text>
          </p>
        </>
      ) : (
        <>
          <SomethingWrong fill="var(--alt-grey)" height="5rem" width="5rem" />
          <p>
            <Text>message.emptyview.unknown</Text>
          </p>
        </>
      )}
      {messages.length !== 0 && (
        <>
          {emptyReason === emptyReasons.NETWORK ? (
            <MessagesHeading>
              <Text>general.error_messages</Text>:
            </MessagesHeading>
          ) : (
            <MessagesHeading>
              <Text>general.error_messages.server</Text>:
            </MessagesHeading>
          )}
          <ErrorList>
            {messages.map((msg, idx) => (
              <ErrorMessage key={`error_message_${idx}`}>{msg}</ErrorMessage>
            ))}
          </ErrorList>
        </>
      )}
    </EmptyViewWrapper>
  );
});

export default EmptyView;
