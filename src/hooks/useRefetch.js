import {useCallback, useEffect} from "react";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import get from "lodash/get";

export const useRefetch = (name, props = {}, reactToAuto = false, skip = false) => {
  const createRefetcher = useCallback(
    (refetch, props) => (isAuto = false) => {
      if (get(props, "skip", skip) === false) {
        // Remove the skip prop, it is not used in queries.
        const {skip, ...queryProps} = props;

        if (isAuto) {
          refetch();
        } else {
          refetch({...queryProps, _cache: false});
        }
      }
    },
    [name, skip]
  );

  useEffect(
    () => () => {
      removeUpdateListener(name);
    },
    [name]
  );

  return useCallback(
    (queryRefetcher) => {
      if (name) {
        setUpdateListener(name, createRefetcher(queryRefetcher, props), reactToAuto);
      }
    },
    [name, createRefetcher, reactToAuto, props]
  );
};
