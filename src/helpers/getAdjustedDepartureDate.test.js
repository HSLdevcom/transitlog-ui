import {getMomentFromDateTime, getTimeString} from "./time";
import {getAdjustedDepartureDate} from "./getAdjustedDepartureDate";

describe("getAdjustedDepartureDate", () => {
  test("returns a moment representing the date and time of the departure", () => {
    const date = "2019-01-30";

    const departure = {
      hours: 16,
      minutes: 13,
    };

    const departureMoment = getAdjustedDepartureDate(departure, date);
    const expectedMoment = getMomentFromDateTime(date, getTimeString(16, 13));

    expect(departureMoment.valueOf()).toBe(expectedMoment.valueOf());
  });

  test("24h+ departures are handled correctly", () => {
    const date = "2019-01-30";

    const departure = {
      hours: 4,
      minutes: 13,
      isNextDay: true,
    };

    const departureMoment = getAdjustedDepartureDate(departure, date);
    // getMomentFromDateTime handles 24h+ times. 28 is 4 in the morning.
    const expectedMoment = getMomentFromDateTime(date, getTimeString(28, 13));

    expect(departureMoment.valueOf()).toBe(expectedMoment.valueOf());
    expect(departureMoment.date()).toBe(31); // The moment's date is "the next day"
  });
});
