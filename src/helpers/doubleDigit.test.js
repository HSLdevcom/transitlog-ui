import doubleDigit from "./doubleDigit";

describe("doubleDigit", () => {
  test("doubleDigit returns a string of a number padded with zeroes", () => {
    const padded = doubleDigit(1);
    expect(padded).toBe("01");

    const padded2 = doubleDigit(10);
    expect(padded2).toBe("10");
  });

  test("doubleDigit does not pad if the number is more than one digit", () => {
    const padded = doubleDigit(11);
    expect(padded).toBe("11");
  });

  test("doubleDigit always returns a string of length 2", () => {
    const padded = doubleDigit(111);
    expect(padded).toBe("11");

    const padded2 = doubleDigit(11100);
    expect(padded2).toBe("00"); // The last two characters are returned
  });

  test("doubleDigit returns string 00 if called without arguments", () => {
    const padded = doubleDigit();
    expect(padded).toBe("00");
  });

  test("doubleDigit can pad the end of the string too", () => {
    const padded = doubleDigit(1, true);
    expect(padded).toBe("10");

    const padded2 = doubleDigit(10, true);
    expect(padded2).toBe("10");

    const padded3 = doubleDigit(100, true);
    expect(padded3).toBe("10"); // in the padEnd case, the FIRST two chars are returned
  });
});
