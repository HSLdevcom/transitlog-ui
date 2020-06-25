import getDelayType, {getDelayStopType} from "./getDelayType";
import {getTimelinessColor} from "./timelinessColor";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";

export const getJourneyStopDiffs = (journeyEvents) => {
  const departureEvents = journeyEvents.filter(
    ({__typename, type}) =>
      __typename === "JourneyStopEvent" && ["DEP", "PDE", "PAS"].includes(type)
  );

  return uniqBy(departureEvents, "stopId").map((event, index) => {
    let departureColor = "var(--light-grey)";
    let y = 0;
    let stopId = null;

    const departureDiff = get(event, "plannedTimeDifference", false);

    if (departureDiff) {
      const departureDelayType = getDelayType(departureDiff, getDelayStopType(event));
      departureColor = getTimelinessColor(departureDelayType, "var(--light-green)");
      y = departureDiff;
      stopId = event.stopId;
    }

    return {
      x: index,
      y: y,
      y0: 0,
      departureColor: departureColor,
      stopId: stopId,
      stopName: get(event, "stop.name", ""),
    };
  });
};
