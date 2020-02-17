import {findJourneyStartPosition} from "./findJourneyStartPosition";

describe("findJourneyStartPosition", () => {
  test("finds the start of the journey", () => {
    // The journeys should be ordered in chronological order.
    // Only next_stop_id is needed for this, but we add an id
    // to verify that the correct item is returned.
    const events = [
      {next_stop_id: "1", id: "1"},
      {next_stop_id: "1", id: "2"},
      {next_stop_id: "2", id: "3"},
    ];

    const originStop = "1";

    const startPosition = findJourneyStartPosition(events, originStop);
    expect(startPosition.id).toBe("2");
  });

  test("returns null if the first event stop does not match the origin stop", () => {
    // The journeys should be ordered in chronological order.
    // Only next_stop_id is needed for this, but we add an id
    // to verify that the correct item is returned.
    const events = [{next_stop_id: "1"}, {next_stop_id: "1"}, {next_stop_id: "2"}];
    const originStop = "2"; // Does not match next_stop_id of the first item in events

    const startPosition = findJourneyStartPosition(events, originStop);
    expect(startPosition).toBe(null);
  });
});
