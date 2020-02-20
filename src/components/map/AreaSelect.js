import React, {useRef, useState, useCallback, useEffect} from "react";
import "leaflet-draw/dist/leaflet.draw.css";
import {FeatureGroup, Rectangle} from "react-leaflet";
import {EditControl} from "react-leaflet-draw";
import {observer} from "mobx-react-lite";
import {setResetListener} from "../../stores/FilterStore";
import CancelControl from "./CancelControl";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";

// Leaflet path style
const rectangleStyle = {
  weight: 2,
  dashArray: "10 4",
  opacity: 1,
  color: "white",
  fillColor: "var(--blue)",
  fillOpacity: 0.1,
};

const decorate = flow(observer, inject("UI"));

const AreaSelect = decorate(({UI, state, enabled}) => {
  const {selectedBounds} = state;
  const featureLayer = useRef(null);

  const [hasAreas, setHasAreas] = useState();

  const checkAreas = useCallback(() => {
    setHasAreas(
      featureLayer.current && featureLayer.current.leafletElement.getLayers().length !== 0
    );
  }, [featureLayer.current]);

  const clearAreas = useCallback(() => {
    // Remove all current layers if we're about to draw a new one or have resetted the UI.
    if (featureLayer.current) {
      featureLayer.current.leafletElement.clearLayers();
    }

    UI.setSelectedBounds(null);
    checkAreas();
  }, [checkAreas]);

  const onCreated = useCallback(
    (e) => {
      const {layer} = e;

      const layerBounds = layer.getBounds();
      UI.setSelectedBounds(layerBounds);
      checkAreas();
    },
    [checkAreas]
  );

  useEffect(() => {
    const resetListener = setResetListener(clearAreas);

    const timeout = setTimeout(() => {
      checkAreas();
    }, 1);

    return () => {
      clearTimeout(timeout);
      resetListener();
    };
  }, []);

  return (
    <FeatureGroup ref={featureLayer}>
      <EditControl
        position="bottomright"
        onCreated={onCreated}
        onDrawStart={clearAreas} // Clear rectangles when the user is about to draw a new one
        edit={{
          // Disable edit and remove buttons
          edit: false,
          remove: false,
        }}
        draw={{
          rectangle: enabled
            ? {
                shapeOptions: rectangleStyle,
              }
            : false,
          polyline: false,
          polygon: false,
          circle: false,
          marker: false,
          circlemarker: false,
        }}
      />
      {hasAreas && <CancelControl position="bottomright" onCancel={clearAreas} />}
      {selectedBounds && (
        // If there were bounds set in the URL, draw them on the map
        <Rectangle bounds={selectedBounds} {...rectangleStyle} />
      )}
    </FeatureGroup>
  );
});

export default AreaSelect;
