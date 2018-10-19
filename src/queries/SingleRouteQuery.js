import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import RouteFieldsFragment from "./RouteFieldsFragment";
import {observer} from "mobx-react";
import parse from "date-fns/parse";
import orderBy from "lodash/orderBy";
import first from "lodash/first";
import isWithinRange from "date-fns/is_within_range";
import {joreClient} from "../api";

export const singleRouteQuery = gql`
  query singleRouteQuery($routeId: String!, $direction: String!) {
    allRoutes(condition: {routeId: $routeId, direction: $direction}) {
      nodes {
        ...RouteFieldsFragment
      }
    }
  }
  ${RouteFieldsFragment}
`;

export const fetchSingleRoute = (route, date) => {
  return joreClient
    .query({
      query: singleRouteQuery,
      variables: route,
    })
    .then(({data}) => get(data, "allRoutes.nodes", []))
    .then((routes) => {
      const queryDate = parse(`${date}T00:00:00`);

      return first(
        orderBy(
          routes.filter(({dateBegin, dateEnd}) => {
            const begin = parse(`${dateBegin}T00:00:00`);
            const end = parse(`${dateEnd}T23:59:00`);

            return isWithinRange(queryDate, begin, end);
          }),
          "dateBegin",
          "desc"
        )
      );
    });
};

export default observer(({children, route, date}) => (
  <Query query={singleRouteQuery} variables={route}>
    {({loading, error, data}) => {
      if (loading) return "Loading...";
      if (error) return "Error!";

      const queryDate = parse(`${date}T00:00:00`);
      const routes = get(data, "allRoutes.nodes", []);

      const filteredRoutes = orderBy(
        routes.filter(({dateBegin, dateEnd}) => {
          const begin = parse(`${dateBegin}T00:00:00`);
          const end = parse(`${dateEnd}T23:59:00`);

          return isWithinRange(queryDate, begin, end);
        }),
        "dateBegin",
        "desc"
      );

      return children({
        loading,
        error,
        route: filteredRoutes[0],
      });
    }}
  </Query>
));
