import React, {useMemo, useRef, useEffect} from "react";
import {observer} from "mobx-react-lite";
import StopMarker from "./StopMarker";
import {latLng} from "leaflet";
import CompoundStopMarker from "./CompoundStopMarker";
import flow from "lodash/flow";
import uniq from "lodash/uniq";
import {inject} from "../../helpers/inject";
import {useQueryData} from "../../hooks/useQueryData";
import gql from "graphql-tag";
import {
  StopFieldsFragment,
  RouteStopFieldsFragment,
} from "../../queries/StopFieldsFragment";
import {useCenterOnPopup} from "../../hooks/useCenterOnPopup";

const decorate = flow(observer, inject("Filters", "UI"));

const StopLayerContent = decorate(({stops, selectedStop, showRadius, state, Filters}) => {
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

      if (stop.stopId === selectedStop?.stopId) {
        stopGroup.push(selectedStop);
      } else {
        stopGroup.push(stop);
      }

      currentAreas.set(groupBounds, stopGroup);
    }

    return Array.from(currentAreas.entries());
  }, [stops, selectedStop]);

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
            key={`stop_cluster_${uniq(stopCluster.map((stop) => stop.stopId))
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
      ...RouteStopFieldsFragment
    }
  }
  ${RouteStopFieldsFragment}
`;

export const allStopsQuery = gql`
  query allStopsQuery($date: Date!, $search: String) {
    stops(date: $date, filter: {search: $search}) {
      ...StopFieldsFragment
    }
  }
  ${StopFieldsFragment}
`;

let stopsVisibleBeforeRouteSelected = false;

const StopLayer = decorate(({showRadius, state, Filters, UI}) => {
  const {
    date,
    stop,
    route,
    mapView,
    mapBounds,
    mapOverlays,
    mapZoom,
    selectedJourney,
  } = state;

  const {data: selectedStop, loading: selectedStopLoading} = useQueryData(
    singleStopQuery,
    {
      skip: !stop || !!selectedJourney,
      variables: {
        stopId: stop,
        date,
      },
    },
    "single stop query"
  );

  const {data: stopsData} = useQueryData(
    allStopsQuery,
    {skip: !!selectedJourney, variables: {date}},
    "all stops query"
  );

  useCenterOnPopup([!!selectedStop, !selectedStopLoading, !selectedJourney]);

  const stops = stopsData || [];
  const stopsHidden = mapZoom < 14 || !mapOverlays.includes("Stops");

  let hasRoute = route && route.routeId;

  // Temporarily deactivate stops layer when route is selected.
  // The user can still choose to see stops if they want.
  useEffect(() => {
    if (hasRoute) {
      if (mapOverlays.includes("Stops")) {
        console.log();
        stopsVisibleBeforeRouteSelected = true;
        UI.changeOverlay("remove")({name: "Stops"});
      } else {
        stopsVisibleBeforeRouteSelected = false;
      }
    }

    if (!hasRoute && stopsVisibleBeforeRouteSelected) {
      UI.changeOverlay("add")({name: "Stops"});
    }
  }, [hasRoute]);

  useEffect(() => {
    if (mapOverlays.includes("Stops")) {
      stopsVisibleBeforeRouteSelected = true;
    } else {
      stopsVisibleBeforeRouteSelected = false;
    }
  }, [mapOverlays]);

  const stopsInArea = useMemo(() => {
    if (selectedJourney || mapZoom < 14 || !mapBounds || stopsHidden) {
      return [];
    }

    return stops.filter(
      ({stopId, lat, lng}) => stopId === stop || mapBounds.contains([lat, lng])
    );
  }, [stop, stops, mapView, mapBounds, mapZoom, selectedJourney, stopsHidden]);

  if (selectedJourney || (stopsHidden && !selectedStop)) {
    return null;
  }

  if (
    stopsHidden &&
    selectedStop &&
    !selectedStop.routes.some(
      (r) => r.routeId === route?.routeId && r.direction === route?.direction
    )
  ) {
    return (
      <StopMarker
        selected={true}
        showRadius={showRadius}
        stop={selectedStop}
        setStop={Filters.setStop}
        date={date}
      />
    );
  }

  return (
    <StopLayerContent
      key="stop layer content"
      selectedStop={selectedStop}
      stops={stopsInArea}
      showRadius={showRadius}
    />
  );
});

export default StopLayer;
