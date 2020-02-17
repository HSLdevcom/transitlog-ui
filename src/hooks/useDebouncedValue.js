import {createValueDebouncer} from "../helpers/createValueDebouncer";
import {useRef} from "react";

export const useDebouncedValue = (value, interval = 500) => {
  const debouncer = useRef(null);

  if (!debouncer.current) {
    debouncer.current = createValueDebouncer(interval);
  }

  return debouncer.current(value);
};
