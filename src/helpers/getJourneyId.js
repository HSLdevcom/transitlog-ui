import {getJourneyObject} from "./getJourneyObject";
import {createCompositeJourney} from "../stores/journeyActions";
import get from "lodash/get";

const getJourneyId = (journey = null, matchVehicle = true) => {
  if (!journey) {
    return "";
  }

  if (typeof journey === "string") {
    const idStr = journey;
    // If we don't want to match the vehicle, strip the vehicle id part from the ID if it exists.
    // The regex removes the part of the ID after the last _ if it contains a /.
    return !matchVehicle ? idStr.replace(/_(?=.*\/.*)([^_]*)$/g, "") : idStr;
  }

  let journeyItem = journey;

  if (typeof journey.oday === "string") {
    journeyItem = getJourneyObject(journey);
  }

  if (typeof journey.journeyType !== "undefined" && journey.journeyType !== "journey") {
    return `${journey.journeyType}_${journey.uniqueVehicleId}`;
  }

  return getJourneyIdFromJourney(journeyItem, matchVehicle);
};

const getJourneyIdFromJourney = (journey = {}, matchVehicle = true) => {
  let {
    departureDate = null,
    departureTime = null,
    routeId = null,
    direction = null,
    uniqueVehicleId = null,
  } = journey;

  if (
    !routeId ||
    !departureDate ||
    !departureTime ||
    (matchVehicle && !uniqueVehicleId)
  ) {
    return "";
  }

  if (!matchVehicle) {
    return `${departureDate}_${departureTime}_${routeId}_${direction}`;
  }

  return `${departureDate}_${departureTime}_${routeId}_${direction}_${uniqueVehicleId}`;
};

export default getJourneyId;

export function createDepartureJourneyId(departure) {
  const plannedDepartureTime = get(departure, "plannedDepartureTime", null);
  const originDepartureTime = get(departure, "originDepartureTime", null);

  const useDepartureTime = originDepartureTime || plannedDepartureTime;

  if (!useDepartureTime) {
    return "";
  }

  const compositeJourney = createCompositeJourney({
    date: useDepartureTime.departureDate,
    route: departure,
    time: useDepartureTime.departureTime,
  });

  return getJourneyId(compositeJourney, false);
}
