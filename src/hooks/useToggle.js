import {useState, useCallback} from "react";

export const useToggle = (initialValue = false) => {
  const [currentValue, setValue] = useState(initialValue);

  const toggleValue = useCallback(() => {
    setValue((prevValue) => !prevValue);
  }, [currentValue]);

  return [currentValue, toggleValue];
};
