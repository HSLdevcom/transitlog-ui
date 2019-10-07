import React from "react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";
import styled from "styled-components";
import Info from "../icons/Info";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";

const messageQuery = gql`
  query uiMessage {
    uiMessage {
      date
      message
    }
  }
`;

const MessageWrapper = styled.div`
  padding: 0.25rem 0.875rem;
  background: var(--dark-grey);
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: white;

  svg {
    display: inline-block;
    margin-right: 0.75rem;
  }
`;

const MessageText = styled.span``;

const MessageDate = styled.span`
  margin-left: auto;
  color: var(--lighter-grey);
  font-size: 0.75rem;
`;

const ServerMessage = () => {
  return (
    <Query query={messageQuery}>
      {({data}) => {
        const {message = "", date = ""} = get(data, "uiMessage", {message: "", date: ""});

        if (!message) {
          return null;
        }

        return (
          <MessageWrapper>
            <Info fill="var(--light-grey)" width="1rem" />
            <MessageText>{message}</MessageText>
            <MessageDate>{moment.tz(date, TIMEZONE).format("D.M.YYYY")}</MessageDate>
          </MessageWrapper>
        );
      }}
    </Query>
  );
};

export default ServerMessage;
