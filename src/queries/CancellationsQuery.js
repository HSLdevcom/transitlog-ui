import React, {useMemo} from "react";
import gql from "graphql-tag";
import {Query} from "@apollo/react-components";
import get from "lodash/get";
import {observer} from "mobx-react";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";
import {useRefetch} from "../hooks/useRefetch";

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

const updateListenerName = "cancellations query";

const CancellationsQuery = decorate(({date, cancellationsSearch, children}) => {
  const queryProps = useMemo(() => ({date, ...cancellationsSearch}), [
    date,
    cancellationsSearch,
  ]);

  const activateRefetch = useRefetch(updateListenerName, queryProps, false);

  return (
    <Query query={cancellationsQuery} variables={queryProps}>
      {({loading, error, data, refetch}) => {
        const cancellations = get(data, "cancellations", []);

        activateRefetch(refetch);

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
