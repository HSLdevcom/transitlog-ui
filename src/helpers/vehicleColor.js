import get from "lodash/get";

const vehicleColors = {
  BUS: "var(--bus-blue)",
  U: "var(--bus-blue)",
  TRAM: "var(--green)",
  RAIL: "var(--purple)",
  TRAIN: "var(--purple)",
  TRUNK: "var(--orange)",
  SUBWAY: "var(--orange)",
  METRO: "var(--orange)",
  FERRY: "var(--light-blue)",
  default: "var(--blue)",
  unsigned: "var(--grey)",
};

export function getModeColor(mode = "default") {
  return get(vehicleColors, mode, vehicleColors.default);
}

// If there are many modes, return the most significant one with explicit logic.
export function getPriorityMode(modes) {
  if (modes.includes("TRUNK")) {
    return "TRUNK";
  }

  if (modes.includes("U")) {
    return "U";
  }

  if (modes.includes("TRAM")) {
    return "TRAM";
  }

  return modes[0];
}
