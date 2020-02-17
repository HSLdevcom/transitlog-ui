import moment from "moment-timezone";
import {journeyStartTime, departureTime} from "./time";
import {TIMEZONE} from "../constants";

describe("journeyStartTime", () => {
  test("journeyStartTime returns a valid time string for when the journey started", () => {
    const journey = {
      journey_start_time: "16:04:00",
      oday: "2019-01-27",
      tst: "2019-01-27T16:30:00.000Z", // UTC timestamp 26 minutes after start
    };

    const startTime = journeyStartTime(journey);
    const expectedStartTime = "16:04:00";

    expect(startTime).toBe(expectedStartTime);
  });

  test("journeyStartTime converts 24h journey start times to 24h+ times", () => {
    // When oday and received-at dates are the same, it checks if the start_time
    // hours are a low number and the received_at hours are a high number.
    const journey1 = {
      journey_start_time: "00:05:00",
      oday: "2019-01-27",
      tst: "2019-01-27T23:59:00.000Z", // UTC timestamp 6 minutes before official start
    };

    const startTime1 = journeyStartTime(journey1);
    const expectedStartTime = "24:05:00";

    expect(startTime1).toBe(expectedStartTime);

    // When dates are different it can determine that it should be a 24h+ time based on that.
    const journey2 = {
      journey_start_time: "00:05:00",
      oday: "2019-01-27",
      tst: "2019-01-28T00:10:00.000Z", // UTC timestamp 5 minutes after start
    };

    const startTime2 = journeyStartTime(journey2);
    expect(startTime2).toBe(expectedStartTime);

    const journey3 = {
      journey_start_time: "04:44:00", // Morning journey
      oday: "2019-01-27",
      tst: "2019-01-28T05:26:00.000Z", // UTC timestamp 42 minutes after start
    };

    const expectedTime3 = "28:44:00";

    const startTime3 = journeyStartTime(journey3);
    expect(startTime3).toBe(expectedTime3);

    const journey4 = {
      journey_start_time: "23:44:00",
      oday: "2019-01-27",
      tst: "2019-01-28T00:13:00.000Z", // UTC timestamp 29 minutes after start, but it's the next day
    };

    const expectedTime4 = "23:44:00"; // Should not be a 24h+ time

    const startTime4 = journeyStartTime(journey4);
    expect(startTime4).toBe(expectedTime4);
  });

  test("journeyStartTime can receive a moment to compare the time against", () => {
    const journey = {
      journey_start_time: "03:30:00",
      oday: "2019-01-27",
      tst: "2019-01-28T03:40:00.000Z", // this should be ignored. 10 minutes after start.
    };

    // 10 minutes after start BUT it's the same date as the oday so it should not be a 24h+ time.
    const compareMoment = moment.tz("2019-01-27T03:40:00.000Z", TIMEZONE);

    const startTime1 = journeyStartTime(journey, compareMoment);
    const expectedStartTime = "03:30:00";

    expect(startTime1).toBe(expectedStartTime);
  });

  test("departureTime returns a journey_start_time-compatible time string for the departure time", () => {
    const departure = {
      isNextDay: false,
      hours: 3,
      minutes: 24,
    };

    const departureTimeStr = departureTime(departure);
    const expectedTime = "03:24:00";

    expect(departureTimeStr).toBe(expectedTime);
  });

  test("departureTime returns a 24h+ time if isNextDay is true", () => {
    const departure = {
      isNextDay: true,
      hours: 3,
      minutes: 24,
    };

    const departureTimeStr = departureTime(departure);
    const expectedTime = "27:24:00";

    expect(departureTimeStr).toBe(expectedTime);
  });
});
