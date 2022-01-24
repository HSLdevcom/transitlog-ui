import {latLng} from "leaflet";

export function closestPointInGeometry(queryPoint, geometry, maxDistance = 100) {
  const queryLatLng = latLng(queryPoint);
  if (geometry.type === "LineString") {
    return closestPointOnLine(queryLatLng, geometry.coordinates, maxDistance);
  } else if (geometry.type === "MultiLineString") {
    return closestPointCompareReducer(
      geometry.coordinates,
      (coordinate) => closestPointOnLine(queryLatLng, coordinate, maxDistance),
      queryLatLng
    );
  } else if (geometry.type === "Point") {
    const closest = closestPointToPoint(geometry.coordinates, queryLatLng);
    console.log(closest);
  }

  return false;
}

export function closestPointToPoint(collection, latlng) {
  const {lat, lng} = latlng;
  const closest = collection.reduce((closest, feature) => {
    const coordinates = feature.geometry.coordinates;
    let distance = Math.hypot(
      Math.abs(lat - coordinates[1]),
      Math.abs(lng - coordinates[0])
    );
    if (!closest || distance < closest.distance) {
      feature.distance = distance;
      return feature;
    }
    return closest;
  }, false);

  if (!closest) {
    return;
  }

  const closestPoint = latLng([
    closest.geometry.coordinates[1],
    closest.geometry.coordinates[0],
  ]);
  return closestPoint;
}

export function closestPointCompareReducer(collection, getCandidate, latlng) {
  return collection.reduce((current, item) => {
    const pointCandidate = getCandidate(item);

    if (
      !current ||
      (!!pointCandidate && latlng.distanceTo(pointCandidate) < latlng.distanceTo(current))
    ) {
      return pointCandidate;
    }

    return current;
  }, false);
}

function closestPointOnLine(queryPoint, lineGeometry, maxDistance = 100) {
  let prevDistance = maxDistance;
  let closestPoint = false;

  for (let i = 0; i < lineGeometry.length; i++) {
    const [lng, lat] = lineGeometry[i];
    const distanceFromQuery = queryPoint.distanceTo([lat, lng]);

    if (distanceFromQuery < prevDistance) {
      prevDistance = distanceFromQuery;
      closestPoint = latLng([lat, lng]);
    }
  }

  return closestPoint;
}
