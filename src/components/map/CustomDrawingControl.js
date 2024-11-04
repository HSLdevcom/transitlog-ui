import React from "react";
import {withLeaflet} from "react-leaflet";
import {renderToStaticMarkup} from "react-dom/server";
import L from "leaflet";
import "leaflet-draw";
import Cross from "../../icons/Cross";
import Square from "../../icons/Square";
import Speedlimit from "../../icons/Speedlimit";
import {text} from "../../helpers/text";

const buttonStyles = {
  backgroundColor: "white",
  cursor: "pointer",
  width: "26px",
  height: "26px",
  padding: "0",
  margin: "2px",
  textAlign: "center",
  fontWeight: "bold",
  fontSize: "18px",
  border: "none",
  fontSize: "10px",
};

class CustomDrawingControl extends React.Component {
  componentDidUpdate(prevProps) {
    const {routeSelected, user, selectedBounds} = this.props;

    if (
      prevProps.routeSelected !== routeSelected ||
      prevProps.user !== user ||
      prevProps.selectedBounds !== selectedBounds
    ) {
      if (this.cancelButton) {
        if (!selectedBounds) {
          this.cancelButton.style.display = "none";
        } else {
          this.cancelButton.style.display = "block";
        }
      }

      if (this.speedButton) {
        if (!routeSelected || !user) {
          this.speedButton.style.display = "none";
        } else {
          this.speedButton.style.display = "block";
        }
      }
    }
  }

  componentDidMount() {
    const {map} = this.props.leaflet;
    this.map = map;

    const customControl = L.Control.extend({
      options: {
        position: "bottomright",
      },
      onAdd: () => {
        const container = L.DomUtil.create("div", "custom-drawing-control");

        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.style.padding = "5px";

        function applyStyles(element, styles) {
          Object.assign(element.style, styles);
        }

        this.cancelButton = L.DomUtil.create("button", "leaflet-bar", container);
        this.speedButton = L.DomUtil.create("button", "leaflet-bar", container);
        this.hfpButton = L.DomUtil.create("button", "leaflet-bar", container);

        this.cancelButton.innerHTML = renderToStaticMarkup(
          <Cross fill="#464646" width="1rem" height="1rem" />
        );
        this.speedButton.innerHTML = renderToStaticMarkup(
          <Speedlimit fill="black" width="1.5rem" height="1.5rem" />
        );
        this.hfpButton.innerHTML = renderToStaticMarkup(
          <Square fill="#464646" width="2rem" height="2rem" />
        );

        applyStyles(this.cancelButton, buttonStyles);
        applyStyles(this.hfpButton, buttonStyles);
        applyStyles(this.speedButton, buttonStyles);
        this.speedButton.style.display = "none";
        this.cancelButton.style.display = "none";

        this.speedButton.title = `${text("map.area_speed_search")}`;

        L.DomEvent.on(this.cancelButton, "click", this.handleCancel, this);
        L.DomEvent.on(this.hfpButton, "click", this.drawBlueRectangle, this);
        L.DomEvent.on(this.speedButton, "click", this.drawRedRectangle, this);

        return container;
      },
    });

    this.control = new customControl();
    this.map.addControl(this.control);

    this.blueRectangleDrawer = new L.Draw.Rectangle(this.map, {
      shapeOptions: {
        weight: 2,
        dashArray: "10 4",
        opacity: 1,
        color: "white",
        fillColor: "var(--blue)",
        fillOpacity: 0.1,
      },
      test: {
        test: "test",
      },
    });

    this.redRectangleDrawer = new L.Draw.Rectangle(this.map, {
      shapeOptions: {
        weight: 2,
        dashArray: "10 4",
        opacity: 1,
        color: "white",
        fillColor: "var(--red)",
        fillOpacity: 0.1,
      },
    });

    this.map.on(L.Draw.Event.CREATED, this.props.onCreated);
  }

  componentWillUnmount() {
    if (this.control) {
      this.map.removeControl(this.control);
    }
    if (this.blueRectangleDrawer) {
      this.blueRectangleDrawer.disable();
    }
    if (this.redRectangleDrawer) {
      this.redRectangleDrawer.disable();
    }
    if (this.map) {
      this.map.off(L.Draw.Event.CREATED, this.props.onCreated);
    }
  }

  drawBlueRectangle = () => {
    this.props.onClear();
    this.redRectangleDrawer.disable();
    this.blueRectangleDrawer.enable();
  };

  drawRedRectangle = () => {
    this.props.onClear();
    this.blueRectangleDrawer.disable();
    this.redRectangleDrawer.enable();
  };

  handleCancel = () => {
    this.blueRectangleDrawer.disable();
    this.redRectangleDrawer.disable();

    this.map.eachLayer((layer) => {
      if (layer instanceof L.Rectangle && !layer._latlngs) {
        this.map.removeLayer(layer);
      }
    });

    if (this.props.onClear) {
      this.props.onClear();
    }
  };

  render() {
    return null;
  }
}

export default withLeaflet(CustomDrawingControl);
