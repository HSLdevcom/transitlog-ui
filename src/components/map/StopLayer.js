import React, {useMemo, useRef} from "react";
import {observer} from "mobx-react-lite";
import StopsByBboxQuery from "../../queries/StopsByBboxQuery";
import StopMarker from "./StopMarker";
import {latLng} from "leaflet";
import CompoundStopMarker from "./CompoundStopMarker";
import {flow} from "lodash";
import {inject} from "../../helpers/inject";
import {getRoundedBbox} from "../../helpers/getRoundedBbox";

const decorate = flow(
  observer,
  inject("state")
);

const getBboxString = (bounds, round = false) => {
  return bounds && typeof bounds.toBBoxString === "function"
    ? round
      ? getRoundedBbox(bounds).toBBoxString()
      : bounds.toBBoxString()
    : typeof bounds === "string"
    ? bounds
    : "";
};

const StopLayerContent = decorate(({stops, showRadius, onViewLocation, state}) => {
  const selectedStopId = state.stop;
  const prevStopAreas = useRef([]);

  const stopAreas = useMemo(() => {
    if (stops.length === 0) {
      return [];
    }

    const currentAreas = new Map();

    for (const stop of stops) {
      const pos = latLng(stop.lat, stop.lng);

      let groupBounds;

      if (currentAreas.size !== 0) {
        const groupEntries = currentAreas.entries();

        for (const [area] of groupEntries) {
          if (area.contains(pos)) {
            groupBounds = area;
            break;
          }
        }
      }

      if (!groupBounds) {
        groupBounds = pos.toBounds(3);
      }

      const stopGroup = currentAreas.get(groupBounds) || [];
      stopGroup.push(stop);
      currentAreas.set(groupBounds, stopGroup);
    }

    return Array.from(currentAreas.entries());
  }, [stops]);

  if (stopAreas.length !== 0) {
    prevStopAreas.current = stopAreas;
  }

  return (
    <>
      {prevStopAreas.current.map(([bounds, stopCluster]) => {
        const clusterIsSelected = stopCluster.some(
          ({stopId}) => stopId === selectedStopId
        );

        return (
          <React.Fragment
            key={`stop_cluster_${stopCluster
              .map((stop) => stop.stopId)
              .sort()
              .join("_")}`}>
            {stopCluster.length === 1 ? (
              <StopMarker
                selected={clusterIsSelected}
                showRadius={showRadius}
                onViewLocation={onViewLocation}
                stop={stopCluster[0]}
              />
            ) : (
              <CompoundStopMarker
                selected={clusterIsSelected}
                bounds={bounds}
                showRadius={showRadius}
                onViewLocation={onViewLocation}
                stops={stopCluster}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
});

const StopLayer = decorate(
  ({bounds, onViewLocation, showRadius, state, selectedStop, zoom = 13}) => {
    const {date} = state;

    const boundsAreValid =
      !!bounds && typeof bounds.isValid === "function" && bounds.isValid();

    const currentBounds = useRef(null);
    let queryBounds = bounds;

    if (currentBounds.current && boundsAreValid) {
      queryBounds = currentBounds.current.contains(bounds)
        ? currentBounds.current
        : bounds;
    } else if (boundsAreValid) {
      currentBounds.current = bounds;
    }

    const bbox = getBboxString(queryBounds, true);

    return (
      <StopsByBboxQuery skip={!bbox || zoom < 14} bbox={bbox} date={date}>
        {({stops = []}) => {
          if (selectedStop && (zoom < 14 || stops.length === 0)) {
            return (
              <StopMarker
                selected={true}
                showRadius={showRadius}
                stop={selectedStop}
                onViewLocation={onViewLocation}
                date={date}
              />
            );
          }

          return (
            <StopLayerContent
              key="stop layer content"
              stops={stops}
              showRadius={showRadius}
              onViewLocation={onViewLocation}
            />
          );
        }}
      </StopsByBboxQuery>
    );
  }
);

export default StopLayer;
