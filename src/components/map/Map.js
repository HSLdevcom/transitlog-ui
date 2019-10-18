import React, {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {
  Map as LeafletMap,
  TileLayer,
  ZoomControl,
  Pane,
  LayersControl,
  FeatureGroup,
  ScaleControl,
  Rectangle,
  CircleMarker,
} from "react-leaflet";
import get from "lodash/get";
import flow from "lodash/flow";
import MapillaryViewer from "./MapillaryViewer";
import styled from "styled-components";
import MapillaryGeoJSONLayer from "./MapillaryGeoJSONLayer";
import {setUrlValue, getUrlValue} from "../../stores/UrlManager";
import {observer} from "mobx-react-lite";
import {observable, action, reaction} from "mobx";
import {inject} from "../../helpers/inject";
import "leaflet/dist/leaflet.css";
import {validBounds} from "../../helpers/validBounds";
import {LatLngBounds, LatLng} from "leaflet";

const MapContainer = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;

  > .leaflet-container {
    width: 100%;
    height: 100%;
    z-index: 0;
    flex: 1 1 50%;
  }
`;

const MapillaryView = styled(MapillaryViewer)`
  width: 100%;
  height: 100%;
  flex: 1 1 50%;
  position: relative;
`;

const visualLog = observable(
  {bounds: [], points: []},
  {bounds: observable.ref, points: observable.ref}
);

// Call this to visualize bounds anywhere in the app. Dev tool.
export const visualizeBounds = action((boundsOrPoint) => {
  if (boundsOrPoint.lat) {
    visualLog.points.push(boundsOrPoint);
  } else {
    visualLog.bounds.push(boundsOrPoint);
  }
});

const decorate = flow(
  observer,
  inject("UI")
);

const Map = decorate(({state, UI, children, className, detailsOpen}) => {
  const {
    mapOverlays,
    currentMapillaryViewerLocation,
    currentMapillaryMapLocation,
    sidePanelVisible,
  } = state;

  const {
    changeOverlay,
    setMapillaryViewerLocation,
    setMapillaryMapLocation,
    setMapView,
    setMapZoom,
    setMapBounds,
  } = UI;

  const mapRef = useRef(null);
  const [canSetView, setCanSetView] = useState(true);

  const leafletMap = useMemo(() => {
    return get(mapRef, "current.leafletElement", null);
  }, [mapRef.current]);

  const [currentBaseLayer, setCurrentBaseLayer] = useState(
    getUrlValue("mapBaseLayer", "Digitransit")
  );

  const onChangeBaseLayer = useCallback(({name}) => {
    setUrlValue("mapBaseLayer", name);
    setCurrentBaseLayer(name);
  });

  const onMapChange = useCallback(
    (e) => {
      const nextCenter = e.target.getCenter();

      if (canSetView) {
        setMapView(nextCenter);
      }
    },
    [canSetView]
  );

  const onMapChanged = useCallback((e) => {
    const center = e.target.getCenter();
    const nextBounds = e.target.getBounds();

    setMapBounds(nextBounds);
    setUrlValue("mapView", `${center.lat},${center.lng}`);
  }, []);

  const onMapZoomed = useCallback((event) => {
    const zoom = event.target.getZoom();
    setMapZoom(zoom);
    setUrlValue("mapZoom", zoom);
    setCanSetView(true);
  }, []);

  // Invalidate map size to refresh map items layout
  useEffect(() => {
    if (leafletMap) {
      setTimeout(() => {
        leafletMap.invalidateSize(true);
      }, 300);
    }
  }, [leafletMap, detailsOpen, sidePanelVisible, currentMapillaryViewerLocation]);

  // De-observed initial map state
  const initialViewport = useMemo(() => {
    const {mapView, mapZoom} = state;
    return [mapView, mapZoom];
  }, []);

  useEffect(() => {
    return reaction(
      () => [state.mapView, state.mapZoom],
      ([currentView, currentZoom]) => {
        if (leafletMap) {
          if (
            currentView instanceof LatLngBounds &&
            validBounds(currentView) &&
            !leafletMap.getBounds().equals(currentView)
          ) {
            leafletMap.fitBounds(currentView);
            setCanSetView(false);
          } else if (
            currentView instanceof LatLng &&
            !leafletMap.getCenter().equals(currentView)
          ) {
            leafletMap.setView(currentView, currentZoom, {animate: false});
          }
        }
      },
      {name: "map view reaction", fireImmediately: true}
    );
  }, [leafletMap]);

  useEffect(() => {
    if (canSetView === false) {
      setTimeout(() => setCanSetView(true), 3000);
    }
  }, [canSetView]);

  return (
    <MapContainer className={className}>
      <LeafletMap
        center={initialViewport[0]}
        zoom={initialViewport[1]}
        ref={mapRef}
        maxZoom={18}
        selectArea={true}
        zoomControl={false}
        onBaselayerchange={onChangeBaseLayer}
        onOverlayadd={changeOverlay("add")}
        onOverlayremove={changeOverlay("remove")}
        onZoomend={onMapZoomed}
        onMove={onMapChange}
        onMoveend={onMapChanged}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer
            name="Digitransit"
            checked={currentBaseLayer === "Digitransit"}>
            <TileLayer
              attribution={
                'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors '
              }
              url="https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}@2x.png"
              tileSize={512}
              zoomOffset={-1}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Aerial" checked={currentBaseLayer === "Aerial"}>
            <TileLayer
              tileSize={256}
              attribution="© Espoon, Helsingin ja Vantaan kauupungit, Kirkkonummen ja Nurmijärven kunnat sekä HSL ja HSY"
              url="https://ortophotos.blob.core.windows.net/hsy-map/hsy_tiles2/{z}/{x}/{y}.jpg"
            />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay
            name="Mapillary"
            checked={mapOverlays.includes("Mapillary")}>
            <MapillaryGeoJSONLayer
              map={get(mapRef, "current.leafletElement", null)}
              viewBbox={state.mapView}
              location={currentMapillaryMapLocation}
              layerIsActive={mapOverlays.includes("Mapillary")}
              onSelectLocation={setMapillaryViewerLocation}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay
            name="Stop radius"
            checked={mapOverlays.includes("Stop radius")}>
            <FeatureGroup>
              {/*
                  The stop radius is rendered in the StopMarker component. This featuregroup
                  is just a dummy so that the option will show in the layer control.
                */}
            </FeatureGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Weather" checked={mapOverlays.includes("Weather")}>
            <FeatureGroup>
              {/*
                  The weather display is rendered in MapContent. This featuregroup
                  is just a dummy so that the option will show in the layer control.
                */}
            </FeatureGroup>
          </LayersControl.Overlay>
        </LayersControl>
        <Pane name="mapillary-lines" style={{zIndex: 390}} />
        <Pane name="mapillary-location" style={{zIndex: 400}} />
        <Pane name="route-lines" style={{zIndex: 410}} />
        <Pane name="event-lines" style={{zIndex: 420}} />
        <Pane name="stop-radius" style={{zIndex: 440}} />
        <Pane name="selected-stop-radius" style={{zIndex: 445}} />
        <Pane name="event-hover" style={{zIndex: 450}} />
        <Pane name="stops" style={{zIndex: 475}} />
        <Pane name="hfp-events" style={{zIndex: 480}} />
        <Pane name="hfp-events-2" style={{zIndex: 485}} />
        <Pane name="hfp-markers" style={{zIndex: 500}} />
        <Pane name="hfp-markers-primary" style={{zIndex: 550}} />
        <Pane name="popups" style={{zIndex: 600}} />
        <ZoomControl position="topright" />
        <ScaleControl position="bottomleft" imperial={false} />
        {visualLog.bounds.length !== 0 &&
          visualLog.bounds.map((bounds, index) => (
            <Rectangle key={`bounds_${index}`} bounds={bounds} />
          ))}
        {visualLog.points.length !== 0 &&
          visualLog.points.map((point, index) => (
            <CircleMarker key={`points_${index}`} center={point} radius={10} />
          ))}
        {children}
      </LeafletMap>
      {currentMapillaryViewerLocation && (
        <MapillaryView
          onCloseViewer={() => setMapillaryViewerLocation(false)}
          elementId="mapillary-viewer"
          onNavigation={setMapillaryMapLocation}
          location={currentMapillaryViewerLocation}
        />
      )}
    </MapContainer>
  );
});

export default Map;
