import {latLngBounds, latLng} from "leaflet";

export function boundsFromBBoxString(bboxString) {
  if (typeof bboxString !== "string") {
    return bboxString;
  }

  // Make sure the parts go into the correct places. Check leaflet docs if unsure.
  const [west, south, east, north] = bboxString.split(",").map(parseFloat);
  return latLngBounds(latLng(south, west), latLng(north, east));
}
