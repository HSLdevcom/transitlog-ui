import gql from "graphql-tag";

export const TlpEventFieldsFragment = gql`
  fragment TlpEventFieldsFragment on TlpEvent {
    requestId
    requestType
    priorityLevel
    reason
    attemptSeq
    decision
    junctionId
    signalGroupId
    signalGroupNbr
    lineConfigId
    pointConfigId
    frequency
    protocol
    recordedAt
    recordedTime
    lat
    lng
    loc
  }
`;
