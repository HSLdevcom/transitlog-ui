import React, {Component} from "react";
import "leaflet-draw/dist/leaflet.draw.css";
import {FeatureGroup, Rectangle} from "react-leaflet";
import {EditControl} from "react-leaflet-draw";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import {observable, action} from "mobx";
import {setResetListener} from "../../stores/FilterStore";
import CancelControl from "./CancelControl";

// Leaflet path style
const rectangleStyle = {
  weight: 2,
  dashArray: "10 4",
  opacity: 1,
  color: "white",
  fillColor: "var(--blue)",
  fillOpacity: 0.1,
};

@inject(app("UI"))
@observer
class AreaSelect extends Component {
  featureLayer = React.createRef();

  @observable
  hasAreas = false;

  onCreated = (e) => {
    const {UI} = this.props;
    const {layer} = e;

    const layerBounds = layer.getBounds();
    UI.onSelectArea(layerBounds);
    this.checkAreas();
  };

  clearAreas = () => {
    const {UI} = this.props;

    // Remove all current layers if we're about to draw a new one or have resetted the UI.
    if (this.featureLayer.current) {
      this.featureLayer.current.leafletElement.clearLayers();
    }

    UI.onSelectArea(null);
    this.checkAreas();
  };

  checkAreas = action(() => {
    this.hasAreas =
      this.featureLayer.current &&
      this.featureLayer.current.leafletElement.getLayers().length !== 0;
  });

  componentDidMount() {
    setResetListener(this.clearAreas);

    setTimeout(() => {
      this.checkAreas();
    }, 1);
  }

  render() {
    const {enabled = true, state} = this.props;

    return (
      <FeatureGroup ref={this.featureLayer}>
        <EditControl
          position="bottomright"
          onCreated={this.onCreated}
          onDrawStart={this.clearAreas} // Clear rectangles when the user is about to draw a new one
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
        {this.hasAreas && (
          <CancelControl position="bottomright" onCancel={this.clearAreas} />
        )}
        {state.areaEventsBounds && (
          // If there were bounds set in the URL, draw them on the map
          <Rectangle bounds={state.areaEventsBounds} {...rectangleStyle} />
        )}
      </FeatureGroup>
    );
  }
}

export default AreaSelect;
