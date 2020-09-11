import gql from "graphql-tag";

export const StopRouteFragment = gql`
  fragment StopRouteFragment on StopRoute {
    id
    routeId
    direction
    originStopId
    origin
    destinationStopId
    destination
    distanceFromPrevious
    distanceFromStart
    isTimingStop
    mode
    name
    stopIndex
  }
`;

export const RouteStopFieldsFragment = gql`
  fragment RouteStopFieldsFragment on RouteStop {
    id
    stopId
    shortId
    lat
    lng
    name
    radius
    routes {
      ...StopRouteFragment
    }
  }
  ${StopRouteFragment}
`;

export const StopFieldsFragment = gql`
  fragment StopFieldsFragment on Stop {
    id
    stopId
    shortId
    lat
    lng
    name
    radius
    modes
  }
`;
