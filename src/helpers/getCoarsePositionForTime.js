import diffDates from "./diffDates";
import get from "lodash/get";

// getJourneyFollowBounds caches the previously matched index so that
// consecutive lookups will be much faster. It saves around 3 ms.
// Sine this is outside a component we also need to save a ref
// to the journey that was searched through.
let prevPosition = {
  journey: "",
  posIndex: 0,
};

// This function is not as precise as the ones used
// for the HFP markers and stop drive-by times. But
// it is a lot cheaper and more performant!
function getCoarsePositionForTime(positionsByJourney, journeyId, time) {
  const positions = get(
    positionsByJourney.find((j) => j.journeyId === journeyId),
    "positions",
    []
  );

  let followPosition = null;

  const prevPosIdx = prevPosition.journey === journeyId ? prevPosition.posIndex : 0;

  for (let posIdx = prevPosIdx; posIdx < positions.length; posIdx++) {
    const pos = positions[posIdx];

    if (pos && Math.abs(diffDates(new Date(pos.receivedAt), time)) <= 15) {
      followPosition = pos;
      prevPosition = {
        journey: journeyId,
        posIndex: posIdx,
      };

      break;
    }
  }

  if (!followPosition) {
    prevPosition = {
      journey: "",
      posIndex: 0,
    };
  }

  return followPosition;
}

export default getCoarsePositionForTime;
