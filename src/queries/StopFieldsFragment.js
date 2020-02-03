import gql from "graphql-tag";

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
    routes {
      id
      direction
      isTimingStop
      originStopId
      routeId
      destination
      origin
      name
      mode
    }
  }
`;
