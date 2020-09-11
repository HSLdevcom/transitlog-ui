import gql from "graphql-tag";
import {RouteStopFieldsFragment} from "./StopFieldsFragment";

export const routeStopsQuery = gql`
  query routeStops($routeId: String!, $direction: Direction!, $date: Date!) {
    routeStops(routeId: $routeId, direction: $direction, date: $date) {
      ...RouteStopFieldsFragment
    }
  }
  ${RouteStopFieldsFragment}
`;
