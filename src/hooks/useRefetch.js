import {useCallback, useEffect, useState} from "react";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import get from "lodash/get";

export const useRefetch = (name, props = {}, reactToAuto = false) => {
  const [refetch, setRefetch] = useState(null);
  const propDeps = Object.values(props);

  const refetchWithProps = useCallback(
    (isAuto = false) => {
      if (
        refetch &&
        typeof refetch === "function" &&
        get(props, "skip", false) === false
      ) {
        console.log(`Refetching: ${name}`);
        // Remove the skip prop, it is not used in queries.
        const {skip, ...queryProps} = props;

        refetch({
          ...queryProps,
          _cache: isAuto,
        });
      }
    },
    [refetch, ...propDeps]
  );

  useEffect(() => {
    if (refetch) {
      setUpdateListener(name, refetchWithProps, reactToAuto);
    }

    return () => {
      removeUpdateListener(name);
    };
  }, [refetch, name, refetchWithProps, reactToAuto]);

  return useCallback(
    (queryRefetcher) => {
      setRefetch(() => queryRefetcher);
    },
    [refetch]
  );
};
