import {createRouteId} from "./keys";

describe("Key helpers", () => {
  test("createRouteId creates a route identifier from a route object", () => {
    const route = {
      routeId: "123",
      direction: "1",
    };

    const routeId = createRouteId(route);
    const expected = "123/1";

    expect(routeId).toBe(expected);
  });

  test("createRouteId can be partial or empty", () => {
    const route1 = {
      routeId: "123",
    };

    const routeId = createRouteId(route1);
    const expected1 = "123";

    expect(routeId).toBe(expected1);

    const route2 = {};

    const routeId2 = createRouteId(route2);
    const expected2 = "";

    expect(routeId2).toBe(expected2);
  });
});
