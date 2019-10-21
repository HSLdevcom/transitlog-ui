import gql from "graphql-tag";
import {AlertFieldsFragment} from "./AlertFieldsFragment";

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
    alerts {
      ...AlertFieldsFragment
    }
    routes {
      id
      direction
      isTimingStop
      originStopId
      routeId
    }
  }
  ${AlertFieldsFragment}
`;
