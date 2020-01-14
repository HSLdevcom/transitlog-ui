import {useQuery} from "@apollo/react-hooks";
import {pickGraphqlData} from "../helpers/pickGraphqlData";
import {useRefetch} from "./useRefetch";
import get from "lodash/get";

export const useQueryData = (query, options = {}, updateName = false, pickData = "") => {
  const {loading, error, data, refetch} = useQuery(query, options);
  const activateRefetch = useRefetch(updateName || "", get(options, "variables", {}));
  const pickedData = pickGraphqlData(data, pickData);

  if (updateName) {
    activateRefetch(refetch);
  }

  return {data: pickedData, loading, error};
};
