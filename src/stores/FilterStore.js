import {extendObservable, action} from "mobx";
import filterActions from "./filterActions";
import mergeWithObservable from "../helpers/mergeWithObservable";
import JourneyActions from "./journeyActions";

const emptyState = {
  date: "2018-05-06",
  stop: "",
  vehicle: "",
  line: {
    lineId: "1006T",
    dateBegin: "",
    dateEnd: "",
  },
  route: {
    routeId: "",
    direction: "",
    dateBegin: "",
    dateEnd: "",
  },
};

export default (state) => {
  extendObservable(state, emptyState);

  const journeyActions = JourneyActions(state);
  const actions = filterActions(state);

  const reset = action(() => {
    mergeWithObservable(state, emptyState);
    journeyActions.setSelectedJourney(null);
  });

  return {
    ...actions,
    reset,
  };
};
