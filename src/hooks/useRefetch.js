import {useCallback, useEffect, useState} from "react";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import get from "lodash/get";

export const useRefetch = (name, props = {}, reactToAuto = false) => {
  const [refetch, setRefetch] = useState(null);

  const refetchWithProps = useCallback(
    (isAuto = false) => {
      if (
        refetch &&
        typeof refetch === "function" &&
        get(props, "skip", false) === false
      ) {
        // Remove the skip prop, it is not used in queries.
        const {skip, ...queryProps} = props;

        refetch({
          ...queryProps,
          _cache: isAuto,
        });
      }
    },
    [refetch, props.skip || false]
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
