import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import doubleDigit from "../helpers/doubleDigit";
import createHistory from "history/createBrowserHistory";
import {pickJourneyProps} from "../helpers/pickJourneyProps";

const history = createHistory();

export function createJourneyPath(journey) {
  const date = new Date(`${journey.oday}T${journey.journey_start_time}`);

  const dateStr = `${date.getFullYear()}${doubleDigit(
    date.getMonth() + 1
  )}${doubleDigit(date.getDate())}`;

  const timeStr = `${doubleDigit(date.getHours())}${doubleDigit(date.getMinutes())}`;

  return `/journey/${dateStr}/${timeStr}/${journey.route_id}/${
    journey.direction_id
  }`;
}

export default (state) => {
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
