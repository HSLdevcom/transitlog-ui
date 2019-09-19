import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";

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

const CancellationsQuery = decorate(({state, date, cancellationsSearch, children}) => {
  return (
    <Query
      query={cancellationsQuery}
      variables={{user: !!state.user, date, ...cancellationsSearch}}>
      {({loading, error, data}) => {
        const cancellations = get(data, "cancellations", []);

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
