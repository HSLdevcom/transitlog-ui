// Creates a value debouncer that only returns a new value every [interval].
// Create a new debouncer for every individual value.
export const createValueDebouncer = (interval = 1000) => {
  let canUpdate = true;
  let returnValue = "";
  let timeout = 0;

  return (value) => {
    if (canUpdate || !returnValue) {
      returnValue = value;
      canUpdate = false;

      clearTimeout(timeout);
      timeout = 0;
    }

    if (timeout === 0) {
      timeout = setTimeout(() => {
        canUpdate = true;
        timeout = 0;
      }, interval);
    }

    return returnValue;
  };
};
