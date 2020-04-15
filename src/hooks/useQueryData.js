import {useQuery, useLazyQuery} from "@apollo/react-hooks";
import {pickGraphqlData} from "../helpers/pickGraphqlData";
import {useRefetch} from "./useRefetch";
import get from "lodash/get";
import {useMemo, useCallback} from "react";

export const useQueryData = (query, options = {}, updateName = false, pickData = "") => {
  const {loading, error, data, refetch} = useQuery(query, options);

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
