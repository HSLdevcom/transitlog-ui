import * as L from "leaflet";
import {MapControl, withLeaflet} from "react-leaflet";
import {css} from "styled-components";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import Cross from "../../icons/Cross";

const controlStyle = css`
  width: 34px;
  height: 34px;
  background-color: white;
  border-radius: 4px;
  border: 2px solid rgba(0, 0, 0, 0.25);
  cursor: pointer;

  &:hover {
    background-color: #a0a098;
  }
`;

L.Control.CancelControl = L.Control.extend({
  _style: null,

  initialize: function(element) {
    this.options.position = element.position;
    this._onCancel = element.onCancel;
    this._style = controlStyle;
  },
  onAdd: function(map) {
    const cancelButton = L.DomUtil.create("button");
    cancelButton.setAttribute("style", this._style);
    cancelButton.setAttribute("id", "draw-cancel-button");
    cancelButton.setAttribute("data-testid", "cancel-area-search-button");
    cancelButton.innerHTML = renderToStaticMarkup(
      <Cross fill="black" width="1rem" height="1rem" />
    );

    cancelButton.onclick = (e) => {
      this._onCancel(e);
    };

    return cancelButton;
  },
  onRemove: function(map) {
    // Do nothing
  },
});

L.control.cancelControl = (opts) => {
  return new L.Control.CancelControl({...opts});
};

class CancelControl extends MapControl {
  control;

  createLeafletElement(props) {
    this.control = L.control.cancelControl({...props});
    return this.control;
  }
}

export default withLeaflet(CancelControl);
