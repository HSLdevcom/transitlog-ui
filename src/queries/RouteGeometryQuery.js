import React, {Component} from "react";
import get from "lodash/get";
import {Query} from "@apollo/react-components";
import gql from "graphql-tag";
import {createRouteId} from "../helpers/keys";

const routeQuery = gql`
  query routeGeometryQuery($routeId: String!, $direction: Direction!, $date: Date!) {
    routeGeometry(routeId: $routeId, direction: $direction, date: $date) {
      id
      mode
      coordinates {
        lat
        lng
      }
    }
  }
`;

// No @observer here, as it doesn't like shouldComponentUpdate
class RouteGeometryQuery extends Component {
  shouldComponentUpdate({route: nextRoute}) {
    const {route} = this.props;
    return !!route.routeId && createRouteId(route) !== createRouteId(nextRoute); // Stop the map from flashing and thrashing
  }

  render() {
    const {route = {}, children, date} = this.props;
    const {routeId = "", direction} = route;

    return (
      <Query
        skip={!routeId}
        query={routeQuery}
        partialRefetch={true}
        variables={{
          routeId,
          direction,
          date,
        }}>
        {({loading, error, data}) => {
          if (loading || error) {
            return null;
          }

          const geometry = get(data, "routeGeometry", {
            id: "",
            mode: "BUS",
            coordinates: [],
          });
          return children({routeGeometry: geometry});
        }}
      </Query>
    );
  }
}

export default RouteGeometryQuery;
