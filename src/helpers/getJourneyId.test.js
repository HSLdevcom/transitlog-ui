import getJourneyId from "./getJourneyId";

describe("getJourneyId", () => {
  const journey = {
    departureDate: "date",
    departureTime: "starttime",
    routeId: "routeid",
    direction: "direction",
    uniqueVehicleId: "vehicle",
  };

  test("Returns a string that uniquely identifies the journey.", () => {
    const journeyId = getJourneyId(journey);
    expect(journeyId).toBe("date_starttime_routeid_direction_vehicle");
  });

  test("Only cares about relevant props.", () => {
    const modifiedJourney = {...journey, irrelevantProp: "irrelevant value"};
    const journeyId = getJourneyId(modifiedJourney);
    expect(journeyId).toBe("date_starttime_routeid_direction_vehicle");
  });
});
