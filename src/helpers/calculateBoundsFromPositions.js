import {latLngBounds, latLng} from "leaflet";

function calculateBoundsFromPositions(points = []) {
  const minPoint = points[0];
  const maxPoint = points[points.length - 1];

  if (!minPoint || !maxPoint) {
    return null;
  }

  const minPosition = latLng(minPoint);
  const maxPosition = latLng(maxPoint);

  return latLngBounds(minPosition, maxPosition);
}

export default calculateBoundsFromPositions;
