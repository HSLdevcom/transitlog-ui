import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {StopFieldsFragment} from "./StopFieldsFragment";
import {AlertFieldsFragment} from "./AlertFieldsFragment";
import {useRefetch} from "../hooks/useRefetch";

export const singleStopQuery = gql`
  query singleStopQuery($stopId: String!, $date: Date!) {
    stop(date: $date, stopId: $stopId) {
      ...StopFieldsFragment
      alerts {
        ...AlertFieldsFragment
      }
    }
  }
  ${StopFieldsFragment}
  ${AlertFieldsFragment}
`;

const updateListenerName = "single stop query";

const SingleStopQuery = ({children, stopId, date, skip}) => {
  const shouldSkip = skip || !stopId;
  const queryProps = {stopId, date};

  const activateRefetch = useRefetch(updateListenerName, queryProps);

  return (
    <Query skip={shouldSkip} query={singleStopQuery} variables={queryProps}>
      {({loading, error, data, refetch}) => {
        if (!data) {
          return children({
            loading,
            error,
            stop: null,
          });
        }

        activateRefetch(refetch);

        const stop = get(data, "stop", null);

        return children({
          loading: false,
          error: null,
          stop,
        });
      }}
    </Query>
  );
};

export default SingleStopQuery;
