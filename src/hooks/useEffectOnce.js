import {useEffect} from "react";

export function useEffectOnce(effect, deps) {
  let didRunSuccessfully = false;

  useEffect(() => {
    if (!didRunSuccessfully) {
      didRunSuccessfully = effect();
    }
  }, deps);
}
