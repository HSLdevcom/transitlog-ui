import gql from "graphql-tag";

const HfpFieldsFragment = gql`
  fragment HfpFieldsFragment on vehicles {
    journey_start_time
    next_stop_id
    received_at
    tst
    tsi
    owner_operator_id
    oper
    vehicle_number
    veh
    lat
    long
    unique_vehicle_id
    drst
    spd
    mode
    dl
    hdg
    oday
    direction_id
    route_id
    desi
    headsign
    __typename
  }
`;

export default HfpFieldsFragment;
