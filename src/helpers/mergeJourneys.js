import groupBy from "lodash/groupBy";
import reduce from "lodash/reduce";

export function mergeJourneys(journeys) {
  return reduce(
    groupBy(journeys, "id"),
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
