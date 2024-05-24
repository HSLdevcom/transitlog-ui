import React, {useEffect} from "react";
import {Polyline} from "react-leaflet";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";
import {observer} from "mobx-react-lite";
import {getModeColor} from "../../helpers/vehicleColor";
import flow from "lodash/flow";
import get from "lodash/get";
import {inject} from "../../helpers/inject";
import {useQueryData} from "../../hooks/useQueryData";
import gql from "graphql-tag";

const routeGeometryQuery = gql`
  query routeGeometryQuery($routeId: String!, $direction: Direction!, $date: Date!) {
    routeGeometry(routeId: $routeId, direction: $direction, date: $date) {
      id
      mode
      coordinates {
        lat
        lng
      }
    }
  }
`;

const decorate = flow(observer, inject("UI"));

const RouteLayer = decorate(({canCenterOnRoute, isTrunkRoute, UI, state}) => {
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
  const coordinates = get(routeGeometry, "coordinates", []);
  let mode = get(routeGeometry, "mode", []);
  if (isTrunkRoute) {
    mode = "TRUNK";
  }
  useEffect(() => {
    if (!route || !route.routeId || !canCenterOnRoute || coordinates.length === 0) {
      return;
    }

    const bounds = calculateBoundsFromPositions(coordinates);

    if (bounds && bounds.isValid()) {
      UI.setMapView(bounds);
    }
  }, [coordinates, canCenterOnRoute, route]);

  const color = getModeColor(mode);
  return <Polyline pane="route-lines" weight={3} positions={coordinates} color={color} />;
});

export default RouteLayer;
