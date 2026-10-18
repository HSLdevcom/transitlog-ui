import {useQuery, useLazyQuery} from "@apollo/react-hooks";
import {pickGraphqlData} from "../helpers/pickGraphqlData";
import {useRefetch} from "./useRefetch";
import get from "lodash/get";
import {useMemo, useCallback, useEffect, useState} from "react";

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

export const useQueryData = (query, options = {}, updateName = false, pickData = "") => {
  const variables = useDebouncedDateVariables(options.variables);
  const {loading, error, data, refetch} = useQuery(query, {...options, variables});

  const activateRefetch = useRefetch(
    updateName || "",
    {skip: options.skip || false, ...get(options, "variables", {})},
    false
  );

  const pickedData = pickGraphqlData(data, pickData);

  if (updateName) {
    activateRefetch(refetch);
  }

  return {data: pickedData, loading, error};
};

export const useLazyQueryData = (query, options, updateName = false, pickData = "") => {
  let queryHookArr = useLazyQuery(query, options);
  const activateRefetch = useRefetch(updateName || "", get(options, "variables", {}));

  let [queryFn, {loading, error, data, refetch, called}] = queryHookArr || [() => {}, {}];

  let execLazyQuery = useCallback(
    (options) => {
      if (updateName) {
        activateRefetch(refetch);
      }

      if (called) {
        return refetch(options?.variables);
      }

      return Promise.resolve(queryFn(options));
    },
    [queryFn, refetch, called, updateName]
  );

  const pickedData = useMemo(() => pickGraphqlData(data, pickData), [data, pickData]);
  return [execLazyQuery, {data: pickedData, loading, error, refetch, called}];
};
