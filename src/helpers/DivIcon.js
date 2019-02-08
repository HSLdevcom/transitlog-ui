// Stolen from https://github.com/jgimbel/react-leaflet-div-icon/blob/master/div-icon.js
import React from "react";
import {render} from "react-dom";
import {DivIcon as LeafletDivIcon, Marker as LeafletMarker} from "leaflet";
import PropTypes from "prop-types";
import {withLeaflet, MapLayer, LeafletProvider} from "react-leaflet";

@withLeaflet
class DivIcon extends MapLayer {
  static propTypes = {
    opacity: PropTypes.number,
    zIndexOffset: PropTypes.number,
  };

  // See https://github.com/PaulLeCam/react-leaflet/issues/275
  createLeafletElement(newProps) {
    const {icon, position, className, html = "", iconSize, ...props} = newProps;
    this.icon = new LeafletDivIcon({className, html, iconSize});

    this.leafletElement = new LeafletMarker(position, {
      ...this.getOptions(props),
      icon: this.icon,
    });

    setTimeout(() => {
      this.renderComponent(newProps);
    }, 1);

    this.contextValue = {...props.leaflet, popupContainer: this.leafletElement};
    return this.leafletElement;
  }

  updateLeafletElement(fromProps, toProps) {
    if (toProps.position !== fromProps.position) {
      this.leafletElement.setLatLng(toProps.position);
    }
    if (toProps.zIndexOffset !== fromProps.zIndexOffset) {
      this.leafletElement.setZIndexOffset(toProps.zIndexOffset);
    }
    if (toProps.opacity !== fromProps.opacity) {
      this.leafletElement.setOpacity(toProps.opacity);
    }
    if (toProps.draggable !== fromProps.draggable) {
      if (toProps.draggable) {
        this.leafletElement.dragging.enable();
      } else {
        this.leafletElement.dragging.disable();
      }
    }

    this.renderComponent(toProps);
  }

  renderComponent(props) {
    const container = this.leafletElement._icon;
    const component = props.icon;

    if (container) {
      render(component, container);
    }
  }

  render() {
    const {children} = this.props;
    return children == null || this.contextValue == null ? null : (
      <LeafletProvider value={this.contextValue}>{children}</LeafletProvider>
    );
  }
}

export default DivIcon;
