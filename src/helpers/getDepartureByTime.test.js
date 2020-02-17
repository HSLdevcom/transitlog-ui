import {getDepartureByTime} from "./getDepartureByTime";

describe("getDepartureByTime", () => {
  test("returns a departure that matches the provided time", () => {
    const departures = [
      {plannedDepartureTime: {departureTime: "13:05"}},
      {plannedDepartureTime: {departureTime: "13:45"}},
      {plannedDepartureTime: {departureTime: "08:18"}},
      {plannedDepartureTime: {departureTime: "08:55"}},
      {plannedDepartureTime: {departureTime: "23:42"}},
      {plannedDepartureTime: {departureTime: "23:09"}},
      {plannedDepartureTime: {departureTime: "26:01"}},
      {plannedDepartureTime: {departureTime: "26:42"}},
      {plannedDepartureTime: {departureTime: "24:20"}},
      {plannedDepartureTime: {departureTime: "24:36"}},
    ];

    const time1 = "13:10:00";
    const departure1 = getDepartureByTime(departures, time1);

    const time2 = "09:33:00";
    const departure2 = getDepartureByTime(departures, time2);

    const time3 = "26:15:00"; // Supports 24h+ times
    const departure3 = getDepartureByTime(departures, time3);

    expect(departure1).toBe(departures[0]);
    expect(departure2).toBeNull();
    expect(departure3).toBe(departures[6]);
  });
});
