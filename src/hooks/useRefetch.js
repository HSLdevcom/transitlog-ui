import {useCallback, useRef} from "react";
import {setUpdateListener} from "../stores/UpdateManager";

export const useRefetch = (name, props = {}, reactToAuto = false) => {
  const refetch = useRef(null);
  const propDeps = Object.values(props);

  const refetchWithProps = useCallback(
    (isAuto = false) => {
      if (
        typeof refetch.current === "function" &&
        (Object.keys(props).length === 0 ||
          Object.entries(props).every(([name, val]) =>
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

  return useCallback(
    (queryRefetcher) => {
      refetch.current = queryRefetcher;
      setUpdateListener(name, refetchWithProps, reactToAuto);
    },
    [name, refetchWithProps, reactToAuto]
  );
};
