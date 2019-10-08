// Stolen from https://github.com/jgimbel/react-leaflet-div-icon/blob/master/div-icon.js
import React from "react";
import {createPortal} from "react-dom";
import {DivIcon as LeafletDivIcon, Marker as LeafletMarker} from "leaflet";
import PropTypes from "prop-types";
import {withLeaflet, MapLayer, LeafletProvider} from "react-leaflet";
import {observer} from "mobx-react";

@withLeaflet
@observer
class DivIcon extends MapLayer {
  static propTypes = {
    opacity: PropTypes.number,
    zIndexOffset: PropTypes.number,
  };

  state = {
    icon: null,
  };

  // See https://github.com/PaulLeCam/react-leaflet/issues/275
  createLeafletElement(newProps) {
    const {icon, position, className, html = "", iconSize, pane, ...props} = newProps;
    const leafletDivIcon = new LeafletDivIcon({className, html, iconSize});

    this.leafletElement = new LeafletMarker(position, {
      ...this.getOptions({...props, pane}),
      icon: leafletDivIcon,
    });

    setTimeout(() => {
      this.setState((prev) => (prev.icon !== icon ? {icon} : null));
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

    this.setState((prev) => (prev.icon !== toProps.icon ? {icon: toProps.icon} : null));
  }

  render() {
    const {children} = this.props;
    const {icon} = this.state;
    const portalContainer = this.leafletElement._icon;

    const context =
      !children || !this.contextValue ? null : (
        <LeafletProvider value={this.contextValue}>{children}</LeafletProvider>
      );

    if (!portalContainer && !context) {
      return null;
    }

    return (
      <>
        {portalContainer && createPortal(icon, portalContainer)}
        {context}
      </>
    );
  }
}

export default DivIcon;
