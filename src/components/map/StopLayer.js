import React, {useMemo, useRef, useEffect} from "react";
import {observer} from "mobx-react-lite";
import StopMarker from "./StopMarker";
import {latLng} from "leaflet";
import CompoundStopMarker from "./CompoundStopMarker";
import flow from "lodash/flow";
import orderBy from "lodash/orderBy";
import {inject} from "../../helpers/inject";
import {useQueryData} from "../../hooks/useQueryData";
import gql from "graphql-tag";
import {StopFieldsFragment} from "../../queries/StopFieldsFragment";

const decorate = flow(observer, inject("Filters", "UI"));

const StopLayerContent = decorate(({stops, showRadius, state, Filters}) => {
  const {stop: selectedStopId, highlightedStop} = state;

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
                selectedStop={selectedStopId}
                highlightedStop={highlightedStop}
                setRoute={Filters.setRoute}
                setStop={Filters.setStop}
              />
            ) : (
              <CompoundStopMarker
                selected={clusterIsSelected}
                bounds={bounds}
                showRadius={showRadius}
                stops={stopCluster}
                selectedStop={selectedStopId}
                highlightedStop={highlightedStop}
                setRoute={Filters.setRoute}
                setStop={Filters.setStop}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
});

export const singleStopQuery = gql`
  query singleStopQuery($stopId: String!, $date: Date!) {
    stop(date: $date, stopId: $stopId) {
      ...StopFieldsFragment
    }
  }
  ${StopFieldsFragment}
`;

export const allStopsQuery = gql`
  query allStopsQuery($date: Date, $search: String) {
    stops(date: $date, filter: {search: $search}) {
      ...StopFieldsFragment
    }
  }
  ${StopFieldsFragment}
`;

const StopLayer = decorate(({showRadius, state, UI}) => {
  const {date, stop, mapView, mapOverlays, selectedJourney, mapZoom} = state;

  const {data: selectedStop} = useQueryData(
    singleStopQuery,
    {
      skip: !stop,
      variables: {
        stopId: stop,
        date,
      },
    },
    "single stop query"
  );

  const {data: stopsData} = useQueryData(
    allStopsQuery,
    {variables: {date}},
    "all stops query"
  );

  const stops = stopsData || [];

  const hideStops =
    !mapOverlays.includes("Stops") || stops.length === 0 || !!selectedJourney;

  useEffect(() => {
    if (!stop || !stops || stops.length === 0) {
      return;
    }

    const stopObj = stops.find((s) => s.stopId === stop);

    if (stopObj) {
      const position = latLng([stopObj.lat, stopObj.lng]);
      UI.setMapView(position);
    }
  }, [stop, stops]);

  const stopsLimit = mapZoom > 16 ? 100 : mapZoom > 15 ? 300 : mapZoom > 14 ? 500 : 1000;

  const stopsInArea = useMemo(() => {
    if (!mapView) {
      return [];
    }

    const mapViewCenter =
      typeof mapView.getCenter === "function" ? mapView.getCenter() : mapView;

    return orderBy(stops, ({lat, lng}) => mapViewCenter.distanceTo([lat, lng])).slice(
      0,
      stopsLimit
    );
  }, [stops, mapView, stopsLimit]);

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

  return (
    <StopLayerContent
      key="stop layer content"
      stops={stopsInArea}
      showRadius={showRadius}
    />
  );
});

export default StopLayer;
