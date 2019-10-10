import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import LeafletMap from "./LeafletMap";
import {app} from "mobx-app";
import trim from "lodash/trim";
import get from "lodash/get";
import throttle from "lodash/throttle";
import {setUrlValue, getUrlValue} from "../../stores/UrlManager";
import {observable, action, runInAction} from "mobx";

const MAP_BOUNDS_URL_KEY = "mapView";

/**
 * This component contains app-specific logic and functions. It wraps LeafletMap,
 * which contains leaflet-specific setup and components.
 */

@inject(app("Journey"))
@observer
class Map extends Component {
  canSetView = false;
  prevCenter = null;

  disposeSidePanelReaction = () => {};

  mapRef = React.createRef();

  @observable
  zoom = 13;

  @observable.ref
  mapView = null;

  setMapZoom = action((zoom) => {
    this.zoom = zoom;
  });

  getLeaflet = () => {
    return get(this.mapRef, "current.leafletElement", null);
  };

  componentDidMount() {
    const map = this.getLeaflet();

    // Center the map on the enter position provided through the URL.
    let urlCenter = "";

    if (map) {
      urlCenter = getUrlValue(MAP_BOUNDS_URL_KEY);
      let [lat = "", lng = "", zoom = this.zoom] = urlCenter.split(",");

      // Use default coordinates if parsing or validation fails.
      if (!lat || !trim(lat) || !parseInt(lat)) {
        lat = 60.170988;
      }
      if (!lng || !trim(lng) || !parseInt(lng)) {
        lng = 24.940842;
      }

      map.setView({lat, lng}, zoom);
    }

    // To prevent the map from moving away from the view shared in the URL, allow
    // view changes only after a timeout. Feel free to adjust if this value doesn't work.
    setTimeout(() => (this.canSetView = true), urlCenter ? 3000 : 0);
  }

  componentDidUpdate({sidePanelOpen: prevSidePanelOpen, detailsOpen: prevDetailsOpen}) {
    const {sidePanelOpen, detailsOpen} = this.props;

    if (sidePanelOpen !== prevSidePanelOpen || detailsOpen !== prevDetailsOpen) {
      setTimeout(() => {
        const leafletMap = this.getLeaflet();

        if (leafletMap) {
          leafletMap.invalidateSize(true);
        }
      }, 300);
    }
  }

  /**
   * This method focuses the Leaflet map on the provided location. Center is either
   * LatLng compatible data or a latLngBounds. Sets the center directly on the Leaflet
   * map, bypassing both state and React-Leaflet. This yields the best performance.
   * @param center LatLng or LatLngBounds representing the location that the map should
   *   center on.
   */
  setMapView = (center) => {
    const map = this.getLeaflet();

    // Bail if we're not allowed to set the view yet (after mount when the position
    // is set from the url) or if there are other problems.
    if (!this.canSetView || !center || !map) {
      return;
    }

    const prevCenter = this.prevCenter;
    let useCenter = center;
    let bounds = null;

    // If we got passed a bounds, get the center from it for validating against
    // prevCenter, but also save the bounds.
    if (typeof useCenter.toBBoxString === "function") {
      useCenter = center.getCenter();
      bounds = center;
    } else {
      useCenter = center;
      bounds = null;
    }

    // We don't want to set invalid centers or centers that were set previously.
    if (
      (!prevCenter && useCenter) ||
      (prevCenter && useCenter && !useCenter.equals(prevCenter))
    ) {
      this.prevCenter = useCenter;

      // If we have a bounds we might as well use it.
      if (bounds) {
        map.fitBounds(bounds);
      } else {
        map.setView(useCenter);
      }
    }
  };

  componentWillUnmount() {
    this.disposeSidePanelReaction();
  }

  // Debounced method that sets the current map position into the URL state when
  // it changes.
  setMapUrlState = throttle(
    (center, zoom) =>
      center.lat &&
      center.lng &&
      zoom &&
      setUrlValue(MAP_BOUNDS_URL_KEY, `${center.lat},${center.lng},${zoom}`),
    500
  );

  onMapChanged = () => {
    const map = this.getLeaflet();
    this.setMapUrlState(map.getCenter(), map.getZoom());
    this.setMapViewState(map);
  };

  // This method sets the observable map view props of this component. This method is
  // called AFTER the view has been changed and it will NOT center the map or change
  // the view, the state is just passed on to children.
  setMapViewState = throttle((map) => {
    if (!map) {
      return;
    }

    const bounds = map.getBounds();
    const {mapView} = this;

    if (mapView && bounds.equals(mapView)) {
      return;
    }

    requestAnimationFrame(() => {
      runInAction(() => (this.mapView = bounds));
    });
  }, 100);

  onZoom = (event) => {
    const zoom = event.target.getZoom();
    this.setMapZoom(zoom);
  };

  // The state is provided through a function to not trigger unwanted re-renders in consumers.
  getMapView = () => this.mapView;

  render() {
    const {children, className} = this.props;

    return (
      <LeafletMap
        mapRef={this.mapRef}
        className={className}
        onMapChanged={this.onMapChanged}
        zoom={this.zoom}
        onZoom={this.onZoom}>
        {children({
          zoom: this.zoom,
          getMapView: this.getMapView,
          setMapView: this.setMapView,
        })}
      </LeafletMap>
    );
  }
}
export default Map;
