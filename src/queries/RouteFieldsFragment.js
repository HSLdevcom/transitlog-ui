import gql from "graphql-tag";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";

export const RouteFieldsFragment = gql`
  fragment RouteFieldsFragment on Route {
    id
    routeId
    direction
    destination
    destinationStopId
    mode
    name
    origin
    originStopId
    trunkRoute
    cancellations {
      ...CancellationFieldsFragment
    }
  }
  ${CancellationFieldsFragment}
`;
