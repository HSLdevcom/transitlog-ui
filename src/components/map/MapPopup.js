import React from "react";
import {Popup} from "react-leaflet";
import {createGlobalStyle} from "styled-components";

const PopupStyle = createGlobalStyle`
  .leaflet-container {
    font-family: inherit !important;
  }

  .leaflet-popup-content {
    margin: 0 !important;
    max-height: 550px; // Sometimes leaflet does not apply a maxHeight so we're doing it here.
    overflow-y: auto;
  }
  
  .leaflet-popup-scrolled {
    border: 0 !important;
  }
  
  .leaflet-popup-content-wrapper {
    padding: 0 !important;
    border-radius: 8px !important;
    overflow: hidden;
  }
  
  .leaflet-popup-close-button {
    width: 1rem !important;
    height: 1.2rem !important;
    font-size: 1.75rem !important;
    top: 0.5rem !important;
    right: 0.6rem !important;
  }
`;

const MapPopup = ({className, children, onClose, onOpen}) => {
  return (
    <>
      <PopupStyle />
      <Popup
        pane="popups"
        className={className}
        autoClose={false}
        autoPan={false}
        keepInView={false}
        onOpen={onOpen}
        onClose={onClose}
        offset={[0, -10]}
        minWidth={350}
        maxWidth={500}>
        {children}
      </Popup>
    </>
  );
};

export default MapPopup;
