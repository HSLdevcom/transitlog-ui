import {useCallback} from "react";
import get from "lodash/get";
import {search} from "../helpers/search";

export const useSearch = (items, keys, searchOptions = {}) => {
  const searchFn = useCallback(
    (value = "") => {
      let resultItems = items;
      const searchTerm = get(value, "value", value);

      if (searchTerm) {
        resultItems = search(items, searchTerm, keys, searchOptions);
      }

      return resultItems;
    },
    [keys, items]
  );

  return searchFn;
};
