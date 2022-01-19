import React, {useRef, useEffect, useCallback} from "react";
import Cross from "../../icons/Cross";
import * as Mapillary from "mapillary-js";
// Fix in mapillary version update
// import "mapillary-js/dist/mapillary.min.css";
import styled from "styled-components";
import {observer} from "mobx-react-lite";

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

const MapillaryViewer = observer(
  ({location, elementId, onNavigation, className, onCloseViewer}) => {
    const mly = useRef(null);
    const resizeListener = useRef(null);
    const prevLocation = useRef(null);

    const createResizeListener = useCallback(
      (currentMly) => () => {
        if (currentMly) {
          console.log("resize mly");
          currentMly.resize();
        }
      },
      []
    );

    const createViewerNavigator = useCallback(
      (currentMly) => (evt) => {
        if (currentMly) {
          currentMly.setCenter([0.5, 0.675]);
        }

        onNavigation(evt);
      },
      []
    );

    const initMapillary = useCallback(() => {
      let currentMly = mly.current;

      if (currentMly) {
        return;
      }

      currentMly = new Mapillary.Viewer(
        elementId,
        "V2RqRUsxM2dPVFBMdnlhVUliTkM0ZzoxNmI5ZDZhOTc5YzQ2MzEw",
        null,
        {
          render: {
            cover: false,
          },
        }
      );

      const currentResizeListener = createResizeListener(currentMly);

      if (resizeListener.current) {
        window.removeEventListener("resize", resizeListener.current);
      }

      window.addEventListener("resize", currentResizeListener);
      resizeListener.current = currentResizeListener;

      currentMly.setFilter(["==", "organizationKey", "mstFdbqROWkgC2sNNU2tZ1"]);
      currentMly.on(Mapillary.Viewer.nodechanged, createViewerNavigator(currentMly));

      mly.current = currentMly;
    }, [mly.current, resizeListener.current]);

    const showLocation = useCallback(
      (location) => {
        if (mly.current && mly.current.isNavigable) {
          mly.current
            .moveCloseTo(location.lat, location.lng)
            .then((node) => console.log(node.key))
            .catch((err) => console.error(err));
        }
      },
      [mly.current, mly.current && mly.current.isNavigable]
    );

    // Clean up separately from other effects
    useEffect(() => {
      if (!mly.current) {
        initMapillary();
      }

      return () => {
        mly.current = null;
        window.removeEventListener("resize", resizeListener.current);
      };
    }, []);

    useEffect(() => {
      if (location && (!prevLocation.current || !location.equals(prevLocation.current))) {
        showLocation(location);
        prevLocation.current = location;
      }
    }, [location, prevLocation.current, showLocation]);

    return (
      <ViewerWrapper className={className}>
        <MapillaryElement id={elementId} />
        <CloseButton onClick={onCloseViewer}>
          <Cross fill="white" width={16} height={16} />
        </CloseButton>
      </ViewerWrapper>
    );
  }
);

export default MapillaryViewer;
