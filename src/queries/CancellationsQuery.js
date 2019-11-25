import React, {useCallback} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";
import {setUpdateListener} from "../stores/UpdateManager";

const cancellationsQuery = gql`
  query cancellationsQuery(
    $date: Date!
    $all: Boolean
    $routeId: String
    $direction: Int
    $departureTime: String
  ) {
    cancellations(
      date: $date
      cancellationSearch: {
        all: $all
        routeId: $routeId
        direction: $direction
        departureTime: $departureTime
      }
    ) {
      ...CancellationFieldsFragment
    }
  }
  ${CancellationFieldsFragment}
`;

const decorate = flow(
  observer,
  inject("state")
);

const updateListenerName = "update cancellations";

const CancellationsQuery = decorate(({date, cancellationsSearch, children}) => {
  const createRefetcher = useCallback(
    (refetch) => () => {
      if (refetch && date) {
        refetch({
          date,
          _cache: false,
          ...cancellationsSearch,
        });
      }
    },
    [date]
  );

  return (
    <Query query={cancellationsQuery} variables={{date, ...cancellationsSearch}}>
      {({loading, error, data, refetch}) => {
        const cancellations = get(data, "cancellations", []);

        setUpdateListener(updateListenerName, createRefetcher(refetch), false);

        return children({
          loading,
          error,
          cancellations,
        });
      }}
    </Query>
  );
});

export default CancellationsQuery;
