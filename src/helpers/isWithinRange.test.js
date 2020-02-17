import {isWithinRange} from "./isWithinRange";

describe("isWithingRange", () => {
  test("checks whether a number is within a range defined by two other numbers", () => {
    const check = 10;
    const checkFails = 30;
    const min = 3;
    const max = 20;

    const isInRange = isWithinRange(check, min, max);
    expect(isInRange).toBeTruthy();

    const isNotInRange = isWithinRange(checkFails, min, max);
    expect(isNotInRange).toBeFalsy();
  });

  test("works with negative numbers", () => {
    const check = -10;
    const checkFails = -40;
    const min = -30;
    const max = 2;

    const isInRange = isWithinRange(check, min, max);
    expect(isInRange).toBeTruthy();

    const isNotInRange = isWithinRange(checkFails, min, max);
    expect(isNotInRange).toBeFalsy();
  });

  test("works with times", () => {
    const check = "12:13:45";
    const checkFails = "11:13:45";
    const min = "12:00:00";
    const max = "20:30:00";

    const isInRange = isWithinRange(check, min, max);
    expect(isInRange).toBeTruthy();

    const isNotInRange = isWithinRange(checkFails, min, max);
    expect(isNotInRange).toBeFalsy();
  });

  test("works with dates", () => {
    const check = "2019-04-13";
    const checkFails = "2019-01-30";
    const min = "2019-03-31";
    const max = "2019-06-01";

    const isInRange = isWithinRange(check, min, max);
    expect(isInRange).toBeTruthy();

    const isNotInRange = isWithinRange(checkFails, min, max);
    expect(isNotInRange).toBeFalsy();
  });
});
