import {useEffect} from "react";
import get from "lodash/get";
import {useLeaflet} from "react-leaflet";

// Give activationConditions as an array of booleans. When all items in the
// activationConditions array are true, the map will attempt to center on
// the currently open popup. It is a good idea to have the loading state of
// the popup content as one of the conditions.
export const useCenterOnPopup = (activationConditions) => {
  const leaflet = useLeaflet();

  useEffect(() => {
    if (activationConditions.some((cond) => !cond)) {
      return;
    }

    setTimeout(() => {
      const popup = get(
        leaflet,
        "popupContainer._popup",
        get(leaflet, "layerContainer._popup", get(leaflet, "map._popup"))
      );

      if (!popup || activationConditions.some((cond) => !cond)) {
        return;
      }

      // Center the map on the center line of the popup body.
      const px = leaflet.map.project(popup._latlng); // find the pixel location on the map where the popup anchor is
      px.y -= popup._container.clientHeight / 2; // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
      leaflet.map.panTo(leaflet.map.unproject(px), {animate: true}); // pan to new center
    }, 100);
  }, [...activationConditions, leaflet]);
};
