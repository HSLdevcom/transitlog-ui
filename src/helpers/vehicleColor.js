import get from "lodash/get";
import orderBy from "lodash/orderBy";
import last from "lodash/last";

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

export function getStopModes(stop) {
  let modes = [...(stop?.modes || []), ...(stop?.routes || []).map((r) => r.mode)];
  return modes.length === 0 ? ["BUS"] : modes;
}

// Get the de facto mode of a stop by checking how many times each mode occurs at the stop.
export function getPriorityMode(modes) {
  // Trunk stops should always be trunk-colored regardless
  // of how many times a trunk route occurs at the stop.
  if (modes.includes("TRUNK")) {
    return "TRUNK";
  }

  let occurrences = {};

  // Count how many occurrences of each mode type we have.
  for (let mode of modes) {
    let count = occurrences[mode] || 0;
    count += 1;
    occurrences[mode] = count;
  }

  // order the modes by the occurrence count. The most occurring modes are first.
  let modeOccurrences = orderBy(
    Object.entries(occurrences),
    (occurrence) => occurrence[1],
    "desc"
  );

  // Return if we only have one mode type.
  if (modeOccurrences.length === 1) {
    return modeOccurrences[0][0];
  }

  // Get the top mode type, and all modes that have close % ratio of occurrences.
  // These are tied for the #1 spot.
  let majorityModes = modeOccurrences.reduce((selectedModes, modeOccurrence) => {
    // Get the occurrence ratio for the mode
    let ratio = Math.floor((modeOccurrence[1] / modes.length) * 100);

    // If this is the first mode, add it to the selection by default
    // as it is the most occurring mode.
    if (selectedModes.length === 0) {
      selectedModes.push([modeOccurrence[0], ratio]);
      return selectedModes;
    }

    // Get the occurrence ratio of the previous mode
    let prevOccurrenceRatio = last(selectedModes)[1];

    // Check the current item's ratio against the previous one. Add a small leeway
    // of 5 percentage units when comparing.
    if (ratio >= prevOccurrenceRatio - 5) {
      // If similar, add it to the selection.
      selectedModes.push([modeOccurrence[0], ratio]);
    }

    return selectedModes;
  }, []);

  // At this point we don't need the occurrence count anymore, so get only the mode names.
  let majorityModeNames = majorityModes.map(([mode]) => mode);

  // Break any possible ties by these handful of priority modes. If any of these are in the
  // modes array, return it as the mode.

  if (majorityModeNames.includes("U")) {
    return "U";
  }

  if (majorityModeNames.includes("TRAM")) {
    return "TRAM";
  }

  return majorityModeNames[0];
}
