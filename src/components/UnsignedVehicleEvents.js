import React from "react";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";
import UnsignedVehicleEventsQuery from "../queries/UnsignedVehicleEventsQuery";

const decorate = flow(observer, inject("state"));

const UnsignedVehicleEvents = decorate(({children, state}) => {
  const {vehicle, date, user, selectedJourney} = state;
  const shouldSkip = selectedJourney || !user || !vehicle;

  return (
    <UnsignedVehicleEventsQuery skip={shouldSkip} vehicleId={vehicle} date={date}>
      {children}
    </UnsignedVehicleEventsQuery>
  );
});

export default UnsignedVehicleEvents;
