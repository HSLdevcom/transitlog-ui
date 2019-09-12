import React from "react";
import Cross from "../../icons/Cross";
import * as Mapillary from "mapillary-js";
import "mapillary-js/dist/mapillary.min.css";
import styled from "styled-components";

const ViewerWrapper = styled.div`
  position: relative;
  display: flex;
`;

const MapillaryElement = styled.div`
  width: 100%;
  height: 100%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 3px;
  right: 3px;
  padding: 0;
  border: 0;
  background: var(--blue);
  color: white;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
`;

class MapillaryViewer extends React.Component {
  mly = null;

  componentDidMount() {
    const {location} = this.props;

    this.initMapillary();
    this.showLocation(location);
  }

  componentDidUpdate(prevProps) {
    const {location} = this.props;
    const prevLocation = prevProps.location;

    if (!location.equals(prevLocation)) {
      this.showLocation(location);
    }
  }

  showLocation(location) {
    if (!this.mly) {
      this.initMapillary();
    }

    if (this.mly.isNavigable) {
      this.mly.moveCloseTo(location.lat, location.lng);
    }
  }

  initMapillary() {
    const {onNavigation = () => {}, elementId} = this.props;

    this.mly = new Mapillary.Viewer(
      elementId,
      "V2RqRUsxM2dPVFBMdnlhVUliTkM0ZzoxNmI5ZDZhOTc5YzQ2MzEw",
      null,
      {
        render: {
          cover: false,
        },
      }
    );

    this.mly.setFilter(["==", "organizationKey", "mstFdbqROWkgC2sNNU2tZ1"]);
    this.mly.on(Mapillary.Viewer.nodechanged, onNavigation);
    window.addEventListener("resize", this.onResize);
  }

  onResize = () => {
    if (this.mly) {
      this.mly.resize();
    }
  };

  componentWillUnmount() {
    this.mly = null;
    window.removeEventListener("resize", this.onResize);
  }

  render() {
    const {className, elementId, onCloseViewer} = this.props;
    return (
      <ViewerWrapper className={className}>
        <MapillaryElement id={elementId} />
        <CloseButton onClick={onCloseViewer}>
          <Cross fill="white" width={16} height={16} />
        </CloseButton>
      </ViewerWrapper>
    );
  }
}

export default MapillaryViewer;
