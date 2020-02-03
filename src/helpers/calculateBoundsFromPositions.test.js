import "@testing-library/jest-dom/extend-expect";
import "jest-styled-components";
import calculateBoundsFromPositions from "./calculateBoundsFromPositions";

describe("calculateBoundsFromPositions", () => {
  test("Calculates a Leaflet latLngBounds from an array of positions", () => {
    const coordinates = [
      [60.0, 24.0],
      [60.1, 24.0],
      [60.1, 24.1],
      [60.0, 24.1],
    ];
    const expectBboxString = "24,60,24.1,60";

    const bounds = calculateBoundsFromPositions(coordinates);
    expect(bounds.toBBoxString()).toBe(expectBboxString);
  });

  test("Returns null for empty positions", () => {
    const bounds = calculateBoundsFromPositions();
    expect(bounds).toBeNull();
  });
});
