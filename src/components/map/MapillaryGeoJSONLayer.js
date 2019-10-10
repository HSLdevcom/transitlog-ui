import React from "react";
import {GeoJSON, FeatureGroup} from "react-leaflet";
import {circleMarker} from "leaflet";
import get from "lodash/get";
import {
  closestPointCompareReducer,
  closestPointInGeometry,
} from "../../helpers/closestPoint";
import subYears from "date-fns/sub_years";
import format from "date-fns/format";
import {visualizeBounds} from "./LeafletMap";

class MapillaryGeoJSONLayer extends React.PureComponent {
  static defaultProps = {
    viewBbox: null,
  };

  geoJSONLayer = React.createRef();
  highlightedLocation = false;
  marker = null;
  eventsEnabled = false;
  prevFetchedBbox = "";
  features = null;

  onHover = (e) => {
    const {layerIsActive} = this.props;
    const {latlng} = e;

    // Bail if the layer isn't active or if we don't have any features
    if (!this.features || !layerIsActive) {
      return;
    }

    // Get the feature closest to where the user is hovering
    let featurePoint = closestPointCompareReducer(
      get(this, "features.features", []),
      (feature) => closestPointInGeometry(latlng, feature.geometry, 200),
      latlng
    );

    this.highlightedLocation = featurePoint;

    featurePoint = featurePoint && !featurePoint.equals(latlng) ? featurePoint : false;
    this.highlightMapillaryPoint(featurePoint);
  };

  createMarker = (position) => {
    return circleMarker(position, {
      radius: 4,
      color: "#ff0000",
      pane: "mapillary-location",
    });
  };

  highlightMapillaryPoint = (position) => {
    const {map} = this.props;

    if (map && position) {
      const marker = this.marker || this.createMarker(position);

      if (!this.marker) {
        this.marker = marker;
        this.marker.addTo(map);
      } else {
        this.marker.setLatLng(position);
      }
    } else if (!position) {
      this.removeMarker();
    }
  };

  onMapClick = () => {
    const {onSelectLocation} = this.props;

    if (this.highlightedLocation) {
      onSelectLocation(this.highlightedLocation);
    }
  };

  componentDidMount() {
    const {layerIsActive, viewBbox} = this.props;

    if (layerIsActive) {
      this.bindEvents();
      this.fetchFeatures(viewBbox);
    }
  }

  componentDidUpdate(prevProps) {
    const {location, layerIsActive, viewBbox} = this.props;
    const {location: prevLocation} = prevProps;

    if (!layerIsActive) {
      this.unbindEvents();
      this.removeMarker();
      return;
    } else {
      this.bindEvents();
    }

    if (location && prevLocation && !location.equals(prevLocation)) {
      this.highlightMapillaryPoint(location);
    }

    if (viewBbox) {
      this.fetchFeatures(viewBbox);
    }
  }

  fetchFeatures = async (bounds) => {
    if (!bounds || !bounds.isValid()) {
      return;
    }

    const minX = bounds.getWest().toFixed(6);
    const minY = bounds.getSouth().toFixed(6);
    const maxX = bounds.getEast().toFixed(6);
    const maxY = bounds.getNorth().toFixed(6);

    const bboxStr = `${minX},${minY},${maxX},${maxY}`;

    if (bboxStr === this.prevFetchedBbox) {
      return;
    }

    this.prevFetchedBbox = bboxStr;
    const minTime = format(subYears(new Date(), 2), "YYYY-MM-DD");

    const url = `https://a.mapillary.com/v3/sequences?bbox=${bboxStr}&client_id=V2RqRUsxM2dPVFBMdnlhVUliTkM0ZzoxNmI5ZDZhOTc5YzQ2MzEw&per_page=500&start_time=${minTime}&organization_keys=mstFdbqROWkgC2sNNU2tZ1`;

    const request = await fetch(url);
    const data = await request.json();

    this.features = data;

    // Set the data imperatively since it won't update reactively.
    if (this.geoJSONLayer.current && this.features) {
      this.geoJSONLayer.current.leafletElement.addData(this.features);
    }
  };

  bindEvents = () => {
    const {map} = this.props;

    if (!map || this.eventsEnabled) {
      return;
    }

    map.on("mousemove", this.onHover);
    map.on("click", this.onMapClick);
    this.eventsEnabled = true;
  };

  unbindEvents = () => {
    const {map} = this.props;

    if (!map || !this.eventsEnabled) {
      return;
    }

    map.off("mousemove", this.onHover);
    map.off("click", this.onMapClick);
    this.eventsEnabled = false;
  };

  removeMarker = () => {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
  };

  componentWillUnmount() {
    this.unbindEvents();
    this.removeMarker();
  }

  render() {
    const {layerIsActive} = this.props;

    return (
      <FeatureGroup>
        {layerIsActive && (
          <GeoJSON
            kaye="mapillary-json"
            pane="mapillary-lines"
            ref={this.geoJSONLayer}
            style={() => ({
              color: "rgb(50, 200, 200)",
              weight: 3,
              opacity: 0.75,
            })}
            data={{type: "FeatureCollection", features: []}} // The data wdoes not update reactively
          />
        )}
      </FeatureGroup>
    );
  }
}

export default MapillaryGeoJSONLayer;
