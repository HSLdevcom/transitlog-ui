import React, {useRef, useCallback, useEffect} from "react";
import "leaflet-draw/dist/leaflet.draw.css";
import {FeatureGroup, Rectangle} from "react-leaflet";
import {observer} from "mobx-react-lite";
import {setResetListener} from "../../stores/FilterStore";
import CustomDrawingControl from "./CustomDrawingControl";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import {SidePanelTabs} from "../../constants";

// Leaflet path style
const hfpRectangleStyle = {
  weight: 2,
  dashArray: "10 4",
  opacity: 1,
  color: "white",
  fillColor: "var(--blue)",
  fillOpacity: 0.2,
};

const speedRectangleStyle = {
  weight: 2,
  dashArray: "10 4",
  opacity: 1,
  color: "white",
  fillColor: "var(--red)",
  fillOpacity: 0.2,
};

const decorate = flow(observer, inject("UI"));

const AreaSelect = decorate(({UI, state, enabled}) => {
  const {route, user, selectedBounds} = state;
  const routeSelected = !!route.routeId;
  const featureLayer = useRef(null);

  const clearAreas = useCallback(() => {
    // Remove all current layers if we're about to draw a new one or have resetted the UI.
    if (featureLayer.current) {
      featureLayer.current.leafletElement.clearLayers();
    }
    UI.setSelectedBounds({bounds: null, speedSearch: false});
  }, [featureLayer.current]);

  const onCreated = useCallback((e) => {
    const {layer} = e;
    const rectangleColor = layer.options.fillColor;
    if (layer && layer.getBounds() && rectangleColor === "var(--red)") {
      UI.setSelectedBounds({bounds: layer.getBounds(), speedSearch: true});
      UI.setSidePanelTab(SidePanelTabs.AreaSpeeds);
    }
    if (layer && layer.getBounds() && rectangleColor === "var(--blue)") {
      UI.setSelectedBounds({bounds: layer.getBounds(), speedSearch: false});
      UI.setSidePanelTab(SidePanelTabs.AreaSpeeds);
    }
  }, []);

  useEffect(() => {
    const resetListener = setResetListener(clearAreas);

    return () => {
      resetListener();
    };
  }, [user, selectedBounds, routeSelected]);

  const rectangleStyles = state.speedSearch ? speedRectangleStyle : hfpRectangleStyle;
  return (
    <FeatureGroup ref={featureLayer}>
      <CustomDrawingControl
        user={user}
        routeSelected={routeSelected}
        UI={UI}
        onCreated={onCreated}
        onClear={clearAreas}
        selectedBounds={selectedBounds}
      />
      {selectedBounds && <Rectangle bounds={selectedBounds} {...rectangleStyles} />}
    </FeatureGroup>
  );
});

export default AreaSelect;
