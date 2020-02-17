// Creates a value debouncer that only returns a new value if function
// returns true. Otherwise it returns the previous value.
export const createManualValueDebouncer = (canChange = () => false) => {
  let returnValue = "";

  return (value) => {
    const shouldChange = canChange(value, returnValue);

    if (!returnValue || shouldChange) {
      returnValue = value;
    }

    return returnValue;
  };
};
