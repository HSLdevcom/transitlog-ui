import React, {useMemo, useRef} from "react";
import {observer} from "mobx-react-lite";
import StopMarker from "./StopMarker";
import {latLng} from "leaflet";
import CompoundStopMarker from "./CompoundStopMarker";
import {flow} from "lodash";
import {inject} from "../../helpers/inject";
import AllStopsQuery from "../../queries/AllStopsQuery";

const decorate = flow(
  observer,
  inject("state")
);

const StopLayerContent = decorate(({stops, showRadius, state}) => {
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
                stop={stopCluster[0]}
              />
            ) : (
              <CompoundStopMarker
                selected={clusterIsSelected}
                bounds={bounds}
                showRadius={showRadius}
                stops={stopCluster}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
});

const StopLayer = decorate(({bounds, showRadius, state, selectedStop, zoom = 13}) => {
  const {date} = state;

  const boundsAreValid =
    !!bounds && typeof bounds.isValid === "function" && bounds.isValid();

  return (
    <AllStopsQuery date={date}>
      {({stops = []}) => {
        const hideStops = zoom < 14 || stops.length === 0 || !boundsAreValid;

        if (hideStops && !selectedStop) {
          return null;
        }

        if (hideStops && selectedStop) {
          return (
            <StopMarker
              selected={true}
              showRadius={showRadius}
              stop={selectedStop}
              date={date}
            />
          );
        }

        const stopsInArea = stops.filter(({lat, lng}) => bounds.contains([lat, lng]));

        return (
          <StopLayerContent
            key="stop layer content"
            stops={stopsInArea}
            showRadius={showRadius}
          />
        );
      }}
    </AllStopsQuery>
  );
});

export default StopLayer;
