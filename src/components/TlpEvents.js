import React from "react";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";
import TlpEventsQuery from "../queries/TlpEventsQuery";

const decorate = flow(observer, inject("state"));

const TlpEvents = decorate(({children, state}) => {
  const {tlp, date} = state;

  const tlpEventSearch = {
    all: tlp.all,
    junctionId: tlp.junctionId,
    signalGroupId: tlp.signalGroupId,
    signalGroupNbr: tlp.signalGroupNbr,
  };

  return (
    <TlpEventsQuery date={date} tlpEventSearch={tlpEventSearch}>
      {children}
    </TlpEventsQuery>
  );
});

export default TlpEvents;
