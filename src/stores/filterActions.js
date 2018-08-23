import {action} from "mobx";
import moment from "moment";
import get from "lodash/get";
import mergeWithObservable from "../helpers/mergeWithObservable";
import JourneyActions from "./journeyActions";

const filterActions = (state) => {
  const journeyActions = JourneyActions(state);

  // Make sure all dates are correctly formed.
  const setDate = action((dateValue) => {
    state.date = moment(dateValue).format("YYYY-MM-DD");
  });

  // Grab the nodeId from the passed stop object.
  const setStop = action((stop = "") => {
    state.stop = get(stop, "nodeId", stop);
  });

  // The uniqueVehicleId we're interested in.
  const setVehicle = action((vehicleId) => {
    state.vehicle = vehicleId || "";
  });

  const setLine = action(({lineId = "", dateBegin = "", dateEnd = ""}) => {
    mergeWithObservable(state.line, {lineId, dateBegin, dateEnd});
  });

  const setRoute = action(
    ({routeId = "", direction = "", dateBegin = "", dateEnd = ""}) => {
      mergeWithObservable(state.route, {
        routeId,
        direction,
        dateBegin,
        dateEnd,
      });

      // When the route changes, also reset the vehicle.
      state.vehicle = "";
    }
  );

  return {
    setDate,
    setStop,
    setVehicle,
    setLine,
    setRoute,
  };
};

export default filterActions;
