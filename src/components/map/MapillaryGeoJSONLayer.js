import React from "react";
import {GeoJSON, FeatureGroup} from "react-leaflet";
import {circleMarker} from "leaflet";
import get from "lodash/get";
import {closestPointToPoint} from "../../helpers/closestPoint";
import subYears from "date-fns/subYears";
import format from "date-fns/format";

import {legacyParse, convertTokens} from "@date-fns/upgrade/v2";

const MAX_ZOOM = 14;

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
    let featurePoint = closestPointToPoint(this.features, latlng);
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
        this.marker.bringToFront();
      }
    } else if (!position) {
      this.removeMarker();
    }
  };

  onMapClick = (evt) => {
    const {onSelectLocation} = this.props;
    onSelectLocation(evt.latlng);
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

  wait = async (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay));
  };

  fetchRetry = async (url, delay, tries, fetchOptions = {}) => {
    const triesLeft = tries - 1;
    if (!triesLeft) {
      throw "Mapillary image fetch failed";
    }

    const res = await fetch(url, fetchOptions);
    if (!res.ok) {
      await this.wait(delay);
      return await this.fetchRetry(url, delay, triesLeft, fetchOptions);
    }
    return res;
  };

  fetchFeatures = async (bounds) => {
    const {map} = this.props;
    if (!bounds || !bounds.isValid() || !map || map.getZoom() <= MAX_ZOOM) {
      this.features = [];
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
    const url = `https://graph.mapillary.com/images?fields=id,geometry&bbox=${bboxStr}&limit=100&organization_id=227572519135262`;
    const delay = 500;
    const tries = 3;
    const fetchOptions = {
      method: "GET",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${process.env.MAPILLARY_CLIENT_TOKEN}`,
      },
    };
    const existingFeatures = {};
    if (this.geoJSONLayer.current) {
      const keys = Object.values(this.geoJSONLayer.current.leafletElement._layers);
      keys.forEach((layer) => {
        if (layer.feature.mapillaryFeature) {
          existingFeatures[layer.feature.imageId] = layer.feature.imageId;
        }
      });
    }
    const newFeatures = [];

    try {
      const authResponse = await this.fetchRetry(url, delay, tries, fetchOptions);
      const json = await authResponse.json();

      if (json && json.data) {
        json.data.forEach((feature) => {
          if (!existingFeatures[feature.id]) {
            newFeatures.push({
              type: "Feature",
              mapillaryFeature: true,
              geometry: {
                type: "Point",
                coordinates: feature.geometry.coordinates,
              },
              imageId: feature.id,
            });
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
    // Set the data imperatively since it won't update reactively.
    if (this.geoJSONLayer.current) {
      this.geoJSONLayer.current.leafletElement.addData(newFeatures);
      this.features = this.features ? this.features.concat(newFeatures) : newFeatures;
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

  pointToLayer(feature, latlng) {
    return circleMarker(latlng, {
      radius: 4,
      color: "#ff0000",
      pane: "mapillary-location",
    });
  }

  render() {
    const {layerIsActive, map} = this.props;
    const showLayer = !map || map.getZoom() > MAX_ZOOM;
    return (
      <FeatureGroup>
        {layerIsActive && showLayer && (
          <GeoJSON
            pointToLayer={this.pointToLayer}
            kaye="mapillary-json"
            pane="mapillary-lines"
            ref={this.geoJSONLayer}
            style={() => ({
              color: "rgb(50, 200, 200)",
              weight: 3,
              opacity: 0.75,
            })}
            data={{type: "FeatureCollection", features: []}} // The data does not update reactively
          />
        )}
      </FeatureGroup>
    );
  }
}

export default MapillaryGeoJSONLayer;
