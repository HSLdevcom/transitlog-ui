import React, {useState, useEffect} from "react";
import {useQuery} from "@apollo/react-hooks";
import {observer} from "mobx-react-lite";
import gql from "graphql-tag";
import get from "lodash/get";
import {RouteFieldsFragment} from "./RouteFieldsFragment";
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
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    const variables = {
      routeId,
      direction,
      date,
    };

    const shouldSkip = skip || !routeId || !date || !direction;

    const {loading, error, data, refetch} = useQuery(singleRouteQuery, {
      variables,
      skip: shouldSkip,
      onCompleted: (data) => {
        onCompleted && onCompleted(data);
        if (retryCount !== 0) {
          setRetryCount(0);
        }
      },
    });

    const activateRefetch = useRefetch(
      updateListenerName,
      {
        ...variables,
        skip: shouldSkip,
      },
      false
    );

    useEffect(() => {
      if (error && retryCount < maxRetries) {
        setRetryCount((prevCount) => prevCount + 1);
        activateRefetch(refetch);
      }
    }, [error, retryCount, maxRetries, activateRefetch, refetch]);

    const fetchedRoute = get(data, "route", null);
    return children({
      loading: loading,
      error: retryCount >= maxRetries ? error : null,
      route: fetchedRoute,
    });
  }
);

export default SingleRouteQuery;
