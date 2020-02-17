import {useRef} from "react";
import {createManualValueDebouncer} from "../helpers/createManualValueDebouncer";

export const useManuallyDebouncedValue = (value, canChange = () => false) => {
  const debouncer = useRef(null);

  if (!debouncer.current) {
    debouncer.current = createManualValueDebouncer(canChange);
  }

  return debouncer.current(value);
};
