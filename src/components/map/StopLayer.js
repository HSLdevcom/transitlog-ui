import React, {useMemo} from "react";
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

const StopLayerContent = ({
  bounds,
  stops,
  selectedStopId,
  showRadius,
  onViewLocation,
}) => {
  const stopAreas = useMemo(() => {
    const currentAreas = new Map();

    for (const stop of stops) {
      const pos = latLng(stop.lat, stop.lng);

      if (!bounds.contains(pos)) {
        continue;
      }

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

    return currentAreas;
  }, [stops, bounds]);

  const arrayAreas = Array.from(stopAreas.entries());

  return arrayAreas.map(([bounds, stopCluster]) => {
    const clusterIsSelected = stopCluster.some(({stopId}) => stopId === selectedStopId);

    return stopCluster.length === 1 ? (
      <StopMarker
        popupOpen={clusterIsSelected}
        showRadius={showRadius}
        onViewLocation={onViewLocation}
        key={`stops_${stopCluster[0].stopId}`}
        stop={stopCluster[0]}
      />
    ) : (
      <CompoundStopMarker
        popupOpen={clusterIsSelected}
        bounds={bounds}
        showRadius={showRadius}
        onViewLocation={onViewLocation}
        key={`stopcluster_${bounds.toBBoxString()}`}
        stops={stopCluster}
      />
    );
  });
};

const StopLayer = decorate(
  ({bounds, onViewLocation, showRadius, state, selectedStop, zoom = 13}) => {
    const {stop: selectedStopId, date} = state;

    if (zoom < 14 && !selectedStopId) {
      return null;
    }

    console.log("render");

    const bbox = getBboxString(bounds);

    return (
      <StopsByBboxQuery skip={!bbox} bbox={bbox}>
        {({stops = []}) => {
          if ((stops.length === 0 || zoom < 14) && selectedStopId) {
            return (
              <StopMarker
                showRadius={showRadius}
                stop={selectedStop}
                onViewLocation={onViewLocation}
                popupOpen={true}
                date={date}
              />
            );
          }

          return (
            <StopLayerContent
              bounds={bounds}
              stops={stops}
              selectedStopId={selectedStopId}
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
