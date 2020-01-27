import {useEffect} from "react";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "./inject";

/*
  A helper component to ensure that the correct vehicle ID is set when a journey is selected.
 */

const decorate = flow(observer, inject("Journey", "Filters"));

const EnsureJourneySelection = decorate(
  ({Filters, Journey, children, journey, loading}) => {
    useEffect(() => {
      if (!loading && journey && journey.uniqueVehicleId) {
        const vehicleId = journey.uniqueVehicleId;
        Filters.setVehicle(vehicleId);
        Journey.setJourneyVehicle(vehicleId);
      }
    }, [journey, loading]);

    return children({journey, loading});
  }
);

export default EnsureJourneySelection;
