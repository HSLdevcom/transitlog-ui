import {withLeaflet, MapLayer} from "react-leaflet/es";
import mapboxLeaflet from "../../helpers/MapboxGlLeaflet";
import {
  closestPointInGeometry,
  closestPointCompareReducer,
} from "../../helpers/closestPoint";
import get from "lodash/get";
import simpleStyle from "../../simple-style.json";

class MapillaryLayer extends MapLayer {
  gl = null;
  highlightedLocation = false;

  createLeafletElement(props) {
    this.gl = mapboxLeaflet({
      style: simpleStyle,
      accessToken: "none",
    });

    this.gl.on("add", ({target}) => {
      const leafletMap = target._map;

      // Wait for the gl stuff to be added
      setTimeout(() => {
        const map = target._glMap;

        leafletMap.on("mousemove", this.onHover(leafletMap, map));

        leafletMap.on("click", () => {
          props.onSelectLocation(this.highlightedLocation);
        });

        // ...and wait for the gl stuff to load
        map.on("load", () => {
          this.addMapillarySource(map);
          this.addMapillaryLayer(map);
        });
      }, 0);
    });

    return this.gl;
  }

  updateLeafletElement(prevProps, props) {
    const {location, leaflet} = props;
    const {location: prevLocation} = prevProps;

    // For some reason this.gl is null here. Wrong context?
    // There should be a better way of finding a specific layer...
    const glMap = Object.values(get(leaflet, "map._layers", {})).reduce(
      (gl, layer) => get(layer, "_glMap", gl),
      null
    );

    if (location && prevLocation && !location.equals(prevLocation) && glMap) {
      this.highlightMapillaryPoint(glMap, location);
    }
  }

  addMapillarySource(map) {
    if (map.getSource("mapillary")) {
      return;
    }

    const mapillarySource = {
      type: "vector",
      tiles: ["https://d25uarhxywzl1j.cloudfront.net/v0.1/{z}/{x}/{y}.mvt"],
      minzoom: 0,
      maxzoom: 14,
    };

    map.addSource("mapillary", mapillarySource);
  }

  addMapillaryLayer(map) {
    if (map.getLayer("mapillary")) {
      return;
    }

    const currentYear = new Date().getFullYear();
    const minDate = new Date(currentYear - 1, 0, 1).getTime();

    map.addLayer({
      id: "mapillary",
      type: "line",
      source: "mapillary",
      "source-layer": "mapillary-sequences",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-opacity": 0.6,
        "line-color": "rgb(50, 200, 200)",
        "line-width": 2,
      },
      filter: [">=", "captured_at", minDate],
    });
  }

  onHover = (leafletMap, glMap) => (e) => {
    const {containerPoint, latlng} = e;

    const pointX = containerPoint.x;
    const pointY = containerPoint.y;

    const bbox = [
      {x: pointX - 40, y: pointY - 40},
      {x: pointX + 40, y: pointY + 40},
    ];

    if (!glMap.getLayer("mapillary")) {
      return;
    }

    const features = glMap.queryRenderedFeatures(bbox, {
      layers: ["mapillary"],
    });

    if (features.length !== 0) {
      let featurePoint = closestPointCompareReducer(
        features,
        (feature) => closestPointInGeometry(latlng, feature.toJSON().geometry, 50),
        latlng
      );

      this.highlightedLocation = featurePoint;

      featurePoint =
        featurePoint && !featurePoint.equals(latlng) ? featurePoint : false;
      this.highlightMapillaryPoint(glMap, featurePoint);
    }
  };

  highlightMapillaryPoint = (glMap, position) => {
    if (typeof position !== "boolean") {
      const pointSource = glMap.getSource("mapillary_point");

      if (!pointSource) {
        glMap.addSource("mapillary_point", {
          type: "geojson",
          data: this.getPointData(position),
        });
      } else {
        requestAnimationFrame(() => {
          pointSource.setData(this.getPointData(position));
        });
      }

      if (!glMap.getLayer("mapillary_point")) {
        glMap.addLayer({
          id: "mapillary_point",
          source: "mapillary_point",
          type: "circle",
          paint: {
            "circle-radius": 5,
            "circle-color": "rgb(255, 0, 0)",
          },
        });
      }
    } else if (!position && glMap.getLayer("mapillary_point")) {
      glMap.removeLayer("mapillary_point");
    }
  };

  getPointData = (position) => {
    return {
      type: "Point",
      coordinates: [position.lng, position.lat],
    };
  };
}

export default withLeaflet(MapillaryLayer);
