import {inflate} from "./inflate";

describe("inflate", () => {
  test("inflate constructs a nested object from a non-nested object with paths as keys", () => {
    const obj = {
      "nested.key": 123,
      "nested.deeper.key": 456,
    };

    const nestedObj = inflate(obj);

    expect(nestedObj.nested.key).toBe(123);
    expect(nestedObj.nested.deeper.key).toBe(456);
    expect(nestedObj["nested.key"]).toBeUndefined();
    expect(nestedObj["nested.deeper.key"]).toBeUndefined();
  });
});
