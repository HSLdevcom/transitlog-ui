import pick from "lodash/pick";

export function getJourneyObject(journeyItem) {
  if (!journeyItem) {
    return {};
  }

  return pick(
    {uniqueVehicleId: "", ...journeyItem},
    "departureDate",
    "departureTime",
    "direction",
    "routeId",
    "uniqueVehicleId"
  );
}
