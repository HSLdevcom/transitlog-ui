import {useCallback, useRef, useEffect} from "react";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";

export const useRefetch = (name, props = {}, reactToAuto = false) => {
  const refetch = useRef(null);
  const propDeps = Object.values(props);

  const refetchWithProps = useCallback(
    (isAuto = false) => {
      if (
        typeof refetch.current === "function" &&
        (Object.keys(props).length === 0 ||
          Object.entries(props).every(([name, val]) =>
            // Check the skip prop separately, if it is true the refetch should not happen.
            // Other props should be truthy or one of the allowed falsy values.
            name === "skip" ? val !== true : val === false || val === 0 || !!val
          ))
      ) {
        console.log(`Refetching: ${name}`);

        refetch.current({
          ...props,
          _cache: isAuto,
        });
      }
    },
    [refetch.current, ...propDeps]
  );

  useEffect(() => {
    setUpdateListener(name, refetchWithProps, reactToAuto);

    return () => {
      console.log(`Removing update listener: ${name}`);
      removeUpdateListener(name);
    };
  }, [name, refetchWithProps, reactToAuto]);

  return useCallback((queryRefetcher) => {
    refetch.current = queryRefetcher;
  }, []);
};
