import set from "lodash/set";

// Given an object with keys like "path.into.nested.object",
// returns a new nested object that mirrors the paths from the keys.

export function inflate(obj) {
  const inflatedObj = {};
  const entries = Object.entries(obj);

  for (const [path, val] of entries) {
    let useVal = val;

    if (val.length === 1) {
      const numVal = parseInt(useVal, 10);

      if (!isNaN(numVal)) {
        useVal = numVal;
      }
    }

    if (useVal === "true") {
      useVal = true;
    }

    if (useVal === "false") {
      useVal = false;
    }

    if (useVal === "null") {
      useVal = null;
    }

    set(inflatedObj, path, useVal);
  }

  return inflatedObj;
}
