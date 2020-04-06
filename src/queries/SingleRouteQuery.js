import React from "react";
import gql from "graphql-tag";
import {Query} from "@apollo/react-components";
import get from "lodash/get";
import {RouteFieldsFragment} from "./RouteFieldsFragment";
import {observer} from "mobx-react-lite";
import {useRefetch} from "../hooks/useRefetch";

const singleRouteQuery = gql`
  query singleRouteQuery($routeId: String!, $direction: Direction!, $date: Date!) {
    route(routeId: $routeId, direction: $direction, date: $date) {
      ...RouteFieldsFragment
    }
  }
  ${RouteFieldsFragment}
`;

const updateListenerName = "single stop query";

const SingleRouteQuery = observer(
  ({children, routeId, direction, date, skip, onCompleted}) => {
    const variables = {
      routeId,
      direction,
      date,
    };

    const shouldSkip = skip || !routeId || !date;

    const activateRefetch = useRefetch(updateListenerName, {
      ...variables,
      skip: shouldSkip,
    });

    return (
      <Query
        onCompleted={onCompleted}
        skip={shouldSkip}
        query={singleRouteQuery}
        variables={variables}>
        {({loading, error, data, refetch}) => {
          if (loading || error || !data) {
            return children({
              loading,
              error,
              route: null,
            });
          }

          const fetchedRoute = get(data, "route", null);
          activateRefetch(refetch);

          return children({
            loading,
            error,
            route: fetchedRoute,
          });
        }}
      </Query>
    );
  }
);

export default SingleRouteQuery;
