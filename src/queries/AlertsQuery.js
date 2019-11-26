import React, {useMemo} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import {AlertFieldsFragment} from "./AlertFieldsFragment";
import {useRefetch} from "../hooks/useRefetch";

const alertsQuery = gql`
  query alertsQuery(
    $time: String!
    $language: String!
    $all: Boolean
    $network: Boolean
    $allRoutes: Boolean
    $allStops: Boolean
    $route: String
    $stop: String
  ) {
    alerts(
      time: $time
      language: $language
      alertSearch: {
        all: $all
        network: $network
        allRoutes: $allRoutes
        allStops: $allStops
        route: $route
        stop: $stop
      }
    ) {
      ...AlertFieldsFragment
    }
  }
  ${AlertFieldsFragment}
`;

const updateListenerName = "alerts query";

const AlertsQuery = observer(({time, language = "fi", alertSearch, children}) => {
  const queryProps = useMemo(() => ({time, language, ...alertSearch}), [
    time,
    language,
    alertSearch,
  ]);

  const activateRefetch = useRefetch(updateListenerName, queryProps);

  return (
    <Query query={alertsQuery} variables={queryProps}>
      {({loading, error, data, refetch}) => {
        const alerts = get(data, "alerts", []);

        activateRefetch(refetch);

        return children({
          loading,
          error,
          alerts,
        });
      }}
    </Query>
  );
});

export default AlertsQuery;
