import React, {useRef} from "react";
import {observer} from "mobx-react-lite";
import {inject} from "../helpers/inject";
import flow from "lodash/flow";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "@apollo/react-components";

const exceptionDaysQuery = gql`
  query exceptionDays($year: String!) {
    exceptionDays(year: $year) {
      id
      exceptionDate
      effectiveDayTypes
      dayType
      modeScope
      description
      exclusive
      startTime
      endTime
    }
  }
`;

const decorate = flow(observer, inject("state"));

const ExceptionDaysQuery = decorate(({state, children}) => {
  const year = state.date.slice(0, 4);
  const prevResults = useRef([]);

  return (
    <Query
      query={exceptionDaysQuery}
      variables={{
        year,
      }}>
      {({data, loading}) => {
        if (!data) {
          return children({exceptionDays: prevResults.current, loading});
        }

        const exceptionDays = get(data, "exceptionDays", []);

        prevResults.current = exceptionDays;
        return children({exceptionDays, loading});
      }}
    </Query>
  );
});

export default ExceptionDaysQuery;
