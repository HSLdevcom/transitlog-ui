import {getTimeRangeFromEvents} from "./getTimeRangeFromEvents";

describe("getTimeRangeFromEvents", () => {
  test("getTimeRangeFromEvents returns a range of seconds for a collection of events", () => {
    // A range of one minute
    const events = [
      {
        recordedAtUnix: 1,
        recordedTime: "06:00",
      },
      {
        recordedAtUnix: 60,
        recordedTime: "06:01",
      },
    ];

    const eventsRange = getTimeRangeFromEvents(events);
    const expectMin = 6 * 60 * 60;
    const expectMax = 6 * 60 * 60 + 60;

    expect(eventsRange.min).toBe(expectMin);
    expect(eventsRange.max).toBe(expectMax);
  });

  test("getTimeRangeFromEvents handles 24h+ ranges over multiple days", () => {
    // A range of one minute during the start of 01-28
    const events = [
      {
        recordedAtUnix: 1,
        recordedTime: "06:00",
      },
      {
        recordedAtUnix: 60,
        recordedTime: "26:00",
      },
    ];

    const eventsRange = getTimeRangeFromEvents(events);
    const expectMin = 6 * 60 * 60;
    const expectMax = 26 * 60 * 60;

    expect(eventsRange.min).toBe(expectMin);
    expect(eventsRange.max).toBe(expectMax);
  });
});
