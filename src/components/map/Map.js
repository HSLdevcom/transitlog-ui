import React, {PureComponent} from "react";
import {inject} from "mobx-react";
import LeafletMap from "./LeafletMap";
import {app} from "mobx-app";
import invoke from "lodash/invoke";
import trim from "lodash/trim";
import get from "lodash/get";
import debounce from "lodash/debounce";
import {setUrlValue, getUrlValue} from "../../stores/UrlManager";
import {reaction} from "mobx";

const MAP_BOUNDS_URL_KEY = "mapView";

/**
 * This component contains app-specific logic and functions. It wraps LeafletMap,
 * which contains leaflet-specific setup and components.
 */

@inject(app("Journey"))
class Map extends PureComponent {
  static defaultProps = {
    onMapChanged: () => {},
    onMapChange: () => {},
    bounds: null,
  };

  canSetView = false;
  prevCenter = null;

  disposeSidePanelReaction = () => {};

  mapRef = React.createRef();

  state = {
    zoom: 13,
    mapView: null,
    currentMapillaryViewerLocation: false,
  };

  setMapillaryViewerLocation = (location) => {
    this.setState({
      currentMapillaryViewerLocation: location,
    });
  };

  setMapZoom = (zoom) => {
    this.setState({
      zoom,
    });
  };

  getLeaflet = () => {
    return get(this.mapRef, "current.leafletElement", null);
  };

  componentDidMount() {
    const {state} = this.props;
    const map = this.getLeaflet();

    this.disposeSidePanelReaction = reaction(
      () =>
        (state.sidePanelVisible ? "visible" : "not visible") +
        (state.journeyDetailsAreOpen ? " details open" : " details closed"),
      () => {
        const leafletMap = this.getLeaflet();

        if (leafletMap) {
          leafletMap.invalidateSize(true);
        }
      },
      {
        delay: 500,
      }
    );

    let urlCenter = "";

    if (map) {
      urlCenter = getUrlValue(MAP_BOUNDS_URL_KEY);

      let [lat = "", lng = "", zoom = this.state.zoom] = urlCenter.split(",");

      if (!lat || !trim(lat) || !parseInt(lat)) {
        lat = 60.170988;
      }

      if (!lng || !trim(lng) || !parseInt(lng)) {
        lng = 24.940842;
      }

      map.setView(
        {
          lat,
          lng,
        },
        zoom
      );
    }

    // To prevent the map from moving away from the view shared in the URL, allow
    // view changes only after a timeout. Feel free to adjust if this value doesn't work.
    setTimeout(() => (this.canSetView = true), urlCenter ? 3000 : 0);
  }

  setMapCenter = (center) => {
    const map = this.getLeaflet();

    if (!this.canSetView || !center || !map) {
      return;
    }

    const prevCenter = this.prevCenter;

    if (!prevCenter || (prevCenter && !center.equals(prevCenter))) {
      this.prevCenter = center;
      map.setView(center);
    }
  };

  componentWillUnmount() {
    this.disposeSidePanelReaction();
  }

  setMapBounds = (bounds = null) => {
    if (this.canSetView && bounds && invoke(bounds, "isValid")) {
      const map = this.getLeaflet();

      if (map) {
        map.fitBounds(bounds);
      }
    }
  };

  setMapView = (map) => {
    if (!map) {
      return;
    }

    const {route} = this.props.state;

    if (route && route.routeId) {
      return;
    }

    this.setState((state) => {
      const bounds = map.getBounds();
      const {mapView} = state;

      if (
        !bounds ||
        !invoke(bounds, "isValid") ||
        (mapView && bounds.equals(mapView))
      ) {
        return state;
      }

      return {
        mapView: bounds,
      };
    });
  };

  onMapChanged = () => {
    const map = this.getLeaflet();
    this.setMapView(map);
    this.setMapUrlState(map.getCenter(), map.getZoom());
  };

  setMapUrlState = debounce(
    (center, zoom) =>
      center.lat &&
      center.lng &&
      zoom &&
      setUrlValue(MAP_BOUNDS_URL_KEY, `${center.lat},${center.lng},${zoom}`),
    500
  );

  onZoom = (event) => {
    const zoom = event.target.getZoom();
    this.setMapZoom(zoom);
  };

  render() {
    const {zoom, currentMapillaryViewerLocation, mapView} = this.state;
    const {children, className} = this.props;

    return (
      <LeafletMap
        setMapillaryViewerLocation={this.setMapillaryViewerLocation}
        currentMapillaryViewerLocation={currentMapillaryViewerLocation}
        mapRef={this.mapRef}
        mapView={mapView}
        className={className}
        onMapChanged={this.onMapChanged}
        onZoom={this.onZoom}>
        {children({
          setViewerLocation: this.setMapillaryViewerLocation,
          zoom,
          mapView,
          setMapBounds: this.setMapBounds,
          setMapCenter: this.setMapCenter,
        })}
      </LeafletMap>
    );
  }
}
export default Map;
