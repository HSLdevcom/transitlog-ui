import React from "react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";
import styled from "styled-components";
import Info from "../icons/Info";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";
import Markdown from "react-markdown";

const messageQuery = gql`
  query uiMessage {
    uiMessage {
      date
      message
    }
  }
`;

const MessageWrapper = styled.div`
  background: var(--dark-grey);
  font-size: 0.875rem;
  color: white;
  display: flex;
  align-items: stretch;

  svg {
    display: inline-block;
    margin-right: 0.75rem;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1 0 auto;
  padding: 0.25rem 0.875rem;
`;

const MessageText = styled(Markdown)`
  a {
    color: var(--light-blue);
  }
`;

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
            <ContentWrapper>
              <Info fill="var(--light-grey)" width="1rem" />
              <MessageText
                source={message}
                unwrapDisallowed={true}
                linkTarget="_blank"
                allowedTypes={[
                  "root",
                  "text",
                  "emphasis",
                  "strong",
                  "delete",
                  "link",
                  "linkReference",
                  "inlineCode",
                ]}
              />
              <MessageDate>{moment.tz(date, TIMEZONE).format("D.M.YYYY")}</MessageDate>
            </ContentWrapper>
          </MessageWrapper>
        );
      }}
    </Query>
  );
};

export default ServerMessage;
