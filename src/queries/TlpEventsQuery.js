import React, {useMemo} from "react";
import gql from "graphql-tag";
import {Query} from "@apollo/react-components";
import get from "lodash/get";
import {observer} from "mobx-react";
import {TlpEventFieldsFragment} from "./TlpEventFieldsFragment";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";
import {useRefetch} from "../hooks/useRefetch";

const tlpEventsQuery = gql`
  query tlpEventsQuery(
    $date: Date!
    $all: Boolean
    $junctionId: Int
    $signalGroupId: Int
    $signalGroupNbr: Int
  ) {
    tlpEvents(
      date: $date
      tlpEventSearch: {
        all: $all
        junctionId: $junctionId
        signalGroupId: $signalGroupId
        signalGroupNbr: $signalGroupNbr
      }
    ) {
      ...TlpEventFieldsFragment
    }
  }
  ${TlpEventFieldsFragment}
`;

const decorate = flow(observer, inject("state"));

const updateListenerName = "tlpEvents query";

const TlpEventsQuery = decorate(({date, tlpEventSearch, children}) => {
  console.log("tlpEventSearch", tlpEventSearch);

  const queryProps = useMemo(() => ({date, ...tlpEventSearch}), [date, tlpEventSearch]);

  const activateRefetch = useRefetch(updateListenerName, queryProps, false);

  return (
    <Query query={tlpEventsQuery} variables={queryProps}>
      {({loading, error, data, refetch}) => {
        const tlpEvents = get(data, "tlpEvents", []);
        console.log("received tlpEvents count", tlpEvents.length);

        activateRefetch(refetch);

        return children({
          loading,
          error,
          tlpEvents,
        });
      }}
    </Query>
  );
});

export default TlpEventsQuery;
