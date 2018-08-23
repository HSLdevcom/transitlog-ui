import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import doubleDigit from "../helpers/doubleDigit";
import pick from "lodash/pick";
import createHistory from "history/createBrowserHistory";

export function pickJourneyProps(hfp) {
  return pick(hfp, "oday", "journeyStartTime", "directionId", "routeId");
}

export function createJourneyPath(journey) {
  const date = new Date(`${journey.oday}T${journey.journeyStartTime}`);

  const dateStr = `${date.getFullYear()}${doubleDigit(
    date.getMonth() + 1
  )}${doubleDigit(date.getDate())}`;

  const timeStr = `${doubleDigit(date.getHours())}${doubleDigit(date.getMinutes())}`;

  return `/journey/${dateStr}/${timeStr}/${journey.routeId}/${journey.directionId}`;
}

export default (state) => {
  const history = createHistory();

  const setSelectedJourney = action((journey = null) => {
    if (
      !journey ||
      (state.selectedJourney &&
        getJourneyId(state.selectedJourney) === getJourneyId(journey))
    ) {
      state.selectedJourney = null;
      history.push("/");
    } else {
      state.selectedJourney = pickJourneyProps(journey);
      history.push(createJourneyPath(journey));
    }
  });

  return {
    setSelectedJourney,
  };
};
