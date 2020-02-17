import {useMemo} from "react";
import {mergeJourneys} from "../helpers/mergeJourneys";
import compact from "lodash/compact";

// Use memoization to prevent the combined journeys from updating too often.

const MergedJourneys = ({children, areaJourneys = [], selectedJourney}) => {
  const currentJourneys = useMemo(() => {
    return mergeJourneys(compact([selectedJourney, ...areaJourneys]));
  }, [areaJourneys, selectedJourney]);

  return children({currentJourneys});
};

export default MergedJourneys;
