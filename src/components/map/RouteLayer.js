import React, {useMemo, useEffect} from "react";
import {GeoJSON} from "react-leaflet";
import {observer} from "mobx-react-lite";
import {getModeColor} from "../../helpers/vehicleColor";
import flow from "lodash/flow";
import get from "lodash/get";
import {inject} from "../../helpers/inject";
import {useQueryData} from "../../hooks/useQueryData";
import gql from "graphql-tag";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";

const routeGeometryQuery = gql`
  query routeGeometryQuery($routeId: String!, $direction: Direction!, $date: Date!) {
    routeGeometry(routeId: $routeId, direction: $direction, date: $date) {
      id
      mode
      geometry
    }
  }
`;

const decorate = flow(observer, inject("UI"));

const RouteLayer = decorate(({canCenterOnRoute, UI, state}) => {
  const {route, date} = state;

  const {data: routeGeometry} = useQueryData(
    routeGeometryQuery,
    {
      skip: !route,
      variables: {
        routeId: route.routeId,
        direction: route.direction,
        date,
      },
    },
    "route geometry query"
  );

  const geoJson = useMemo(() => {
    let geometryJson = get(routeGeometry, "geometry");

    if (!geometryJson) {
      return null;
    }

    return JSON.parse(geometryJson);
  }, [routeGeometry]);

  const mode = get(routeGeometry, "mode", []);

  useEffect(() => {
    if (!route || !route.routeId || !canCenterOnRoute || !geoJson) {
      return;
    }

    let coordinates = get(geoJson, "geometry.coordinates", []);

    if (coordinates.length === 0) {
      return;
    }

    const bounds = calculateBoundsFromPositions(coordinates);

    if (bounds && bounds.isValid()) {
      UI.setMapView(bounds);
    }
  }, [geoJson, canCenterOnRoute, route]);

  const color = getModeColor(mode);

  if (!geoJson) {
    return null;
  }

  return <GeoJSON pane="route-lines" data={geoJson} style={() => ({color, weight: 3})} />;
});

export default RouteLayer;
