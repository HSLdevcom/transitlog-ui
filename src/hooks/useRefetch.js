import {useCallback, useRef, useEffect} from "react";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import get from "lodash/get";

export const useRefetch = (name, props = {}, reactToAuto = false) => {
  const refetch = useRef(null);
  const propDeps = Object.values(props);

  const refetchWithProps = useCallback(
    (isAuto = false) => {
      if (typeof refetch.current === "function" && get(props, "skip", false) === false) {
        console.log(`Refetching: ${name}`);
        // Remove the skip prop, it is not used in queries.
        const {skip, ...queryProps} = props;

        refetch.current({
          ...queryProps,
          _cache: isAuto,
        });
      }
    },
    [refetch.current, ...propDeps]
  );

  useEffect(() => {
    if (refetch.current) {
      setUpdateListener(name, refetchWithProps, reactToAuto);
    }

    return () => {
      removeUpdateListener(name);
    };
  }, [refetch.current, name, refetchWithProps, reactToAuto]);

  return useCallback((queryRefetcher) => {
    refetch.current = queryRefetcher;
  }, []);
};
