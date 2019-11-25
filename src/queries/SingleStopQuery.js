import React, {useCallback} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {StopFieldsFragment} from "./StopFieldsFragment";
import {AlertFieldsFragment} from "./AlertFieldsFragment";
import {setUpdateListener} from "../stores/UpdateManager";

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

const updateListenerName = "update single stop";

const SingleStopQuery = ({children, stopId, date, skip}) => {
  const createRefetcher = useCallback(
    (refetch) => () => {
      if (refetch && stopId && date && !skip) {
        refetch({
          stopId,
          date,
          _cache: false,
        });
      }
    },
    [stopId, date, skip]
  );

  return (
    <Query skip={skip || !stopId} query={singleStopQuery} variables={{stopId, date}}>
      {({loading, error, data, refetch}) => {
        if (!data) {
          return children({
            loading,
            error,
            stop: null,
          });
        }

        setUpdateListener(updateListenerName, createRefetcher(refetch), false);

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
