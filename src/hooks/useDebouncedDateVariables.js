import {useEffect, useState} from "react";

const DATE_QUERY_DEBOUNCE_MS = 400;

export const useDebouncedDateVariables = (variables = {}) => {
  const dateVariables = Object.keys(variables)
    .filter((key) => /date$/i.test(key))
    .reduce((result, key) => {
      result[key] = variables[key];
      return result;
    }, {});
  const dateVariablesKey = JSON.stringify(dateVariables);
  const [debouncedDateVariablesKey, setDebouncedDateVariablesKey] = useState(
    dateVariablesKey
  );

  useEffect(() => {
    if (dateVariablesKey === debouncedDateVariablesKey) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      console.log("[date-query-debounce] Triggered", dateVariables);
      setDebouncedDateVariablesKey(dateVariablesKey);
    }, DATE_QUERY_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [dateVariablesKey, debouncedDateVariablesKey]);

  return {...variables, ...JSON.parse(debouncedDateVariablesKey)};
};
