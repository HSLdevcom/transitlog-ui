import {pickJourneyProps} from "../stores/journeyActions";

export default (journey = null) => {
  const {
    oday = null,
    journeyStartTime = null,
    routeId = null,
    directionId = null,
  } = pickJourneyProps(journey || {});

  if (!oday || !journeyStartTime) return "";

  return `journey:${oday}_${journeyStartTime}_${routeId}_${directionId}`;
};
