import get from "lodash/get";
import operators from "../operators.json";

export function getOperatorName(operatorId) {
  const cleanId = parseInt(operatorId);
  return get(operators, cleanId, cleanId);
}
