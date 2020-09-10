import gql from "graphql-tag";

export const routeStopsQuery = gql`
  query routeStops($routeId: String!, $direction: Direction!, $date: Date!) {
    routeStops(routeId: $routeId, direction: $direction, date: $date) {
      id
      stopId
      shortId
      lat
      lng
      name
      radius
      routes {
        id
        routeId
        direction
        originStopId
        origin
        destination
        stopIndex
        isTimingStop
        mode
        destination
        distanceFromPrevious
        distanceFromStart
        duration
      }
    }
  }
`;
