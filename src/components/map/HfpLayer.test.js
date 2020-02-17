import {getLineChunksByDelay} from "./JourneyLayer";

describe("SimpleHfpLayer", () => {
  const baseEvent = {
    delay: 0,
    lat: 1,
    lng: 1,
  };

  function createEvents() {
    const events = [];

    while (events.length < 10) {
      const i = events.length;

      events.push({
        ...baseEvent,
        delay: i > 6 ? 40 : i > 3 ? 0 : -300, // Create three chunks
      });
    }

    return events;
  }

  test("Cut the hfp events array into chunks by delayType", () => {
    const events = createEvents();
    const eventChunks = getLineChunksByDelay(events);

    expect(eventChunks).toHaveLength(3);
    expect(eventChunks[0].delayType).toBe("late");
    expect(eventChunks[0].events.length).toBeGreaterThanOrEqual(3);
    expect(eventChunks[1].delayType).toBe("on-time");
    expect(eventChunks[1].events.length).toBeGreaterThanOrEqual(3);
    expect(eventChunks[2].delayType).toBe("early");
    expect(eventChunks[2].events.length).toBeGreaterThanOrEqual(3);
  });
});
