import groupBy from "lodash/groupBy";
import reduce from "lodash/reduce";
import getJourneyId from "./getJourneyId";

export function mergeJourneys(journeys) {
  return reduce(
    groupBy(journeys, getJourneyId),
    (mergedJourneys, journeyGroup) => {
      if (journeyGroup.length === 1) {
        mergedJourneys.push(journeyGroup[0]);
        return mergedJourneys;
      }

      let selectedJourney = null;

      // Select the journey with the most events
      for (const journey of journeyGroup) {
        if (
          !selectedJourney ||
          (typeof journey.events !== "undefined" && journey.events.length !== 0) ||
          journey.vehiclePositions.length > selectedJourney.vehiclePositions.length
        ) {
          selectedJourney = journey;
        }
      }

      mergedJourneys.push(selectedJourney);
      return mergedJourneys;
    },
    []
  );
}
