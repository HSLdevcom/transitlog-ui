import React, {useRef, useEffect, useCallback} from "react";
import * as turf from "@turf/turf";
import Cross from "../../icons/Cross";
import {Viewer} from "mapillary-js";
import "mapillary-js/dist/mapillary.css";
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

    const getClosestMapillaryImage = async ({lat, lng}) => {
      const p = turf.point([lng, lat]);
      const buffer = turf.buffer(p, 0.05, {units: "kilometers"});
      const bbox = turf.bbox(buffer);
      const authResponse = await fetch(
        `https://graph.mapillary.com/images?fields=id,geometry&bbox=${bbox}&limit=100&organization_id=227572519135262`,
        {
          method: "GET",
          contentType: "application/json",
          headers: {
            Authorization: `Bearer ${process.env.MAPILLARY_CLIENT_TOKEN}`,
          },
        }
      );

      const json = await authResponse.json();
      if (!json.data) {
        return null;
      }
      let closest;
      json.data.forEach((feature) => {
        const coordinates = feature.geometry.coordinates;
        let distance = Math.hypot(
          Math.abs(lat - coordinates[1]),
          Math.abs(lng - coordinates[0])
        );
        if (!closest || distance < closest.distance) {
          closest = feature;
          closest.distance = distance;
        }
      });

      return closest;
    };

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

        onNavigation(evt.image.lngLat);
      },
      []
    );

    const initMapillary = useCallback(() => {
      let currentMly = mly.current;

      if (currentMly) {
        return;
      }

      const accessToken = process.env.REACT_APP_MAPILLARY_CLIENT_TOKEN;
      const viewerOptions = {
        accessToken,
        container: elementId,
        render: {cover: false},
        imageKey: "2143821709111283",
      };
      currentMly = new Viewer(viewerOptions);

      const currentResizeListener = createResizeListener(currentMly);

      if (resizeListener.current) {
        window.removeEventListener("resize", resizeListener.current);
      }

      window.addEventListener("resize", currentResizeListener);
      resizeListener.current = currentResizeListener;

      currentMly.setFilter(["==", "organizationKey", "227572519135262"]);
      currentMly.on("image", createViewerNavigator(currentMly));

      mly.current = currentMly;
    }, [mly.current, resizeListener.current]);

    const showLocation = useCallback(
      async (location) => {
        if (mly.current) {
          const closest = await getClosestMapillaryImage({
            lat: location.lat,
            lng: location.lng,
          });
          if (closest && closest.id) {
            mly.current
              .moveTo(closest.id)
              .then((node) => {
                onNavigation(node.lngLat);
              })
              .catch((error) => console.warn(error));
          }
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
