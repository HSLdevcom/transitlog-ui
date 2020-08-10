import React from "react";
import {Tooltip, CircleMarker} from "react-leaflet";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import {useQueryData} from "../../hooks/useQueryData";
import gql from "graphql-tag";
import {Text} from "../../helpers/text";

const routeSegmentQuery = gql`
  query routeSegmentQuery($routeId: String!, $direction: Direction!, $date: Date!) {
    routeSegments(routeId: $routeId, direction: $direction, date: $date) {
      id
      distanceFromPrevious
      distanceFromStart
      duration
      lat
      lng
      modes
      stopId
      stopIndex
    }
  }
`;

const decorate = flow(observer, inject("UI"));

const RouteSegmentLengthLayer = decorate(({state}) => {
  const {route, date} = state;

  const {data: routeSegments} = useQueryData(
    routeSegmentQuery,
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

  let segments = routeSegments || [];

  return segments.map((segment, idx) => {
    if (idx === 0) {
      // Skip first stop. It has no useful information.
      return null;
    }

    let isLeft = idx % 2 === 0;

    return (
      <CircleMarker key={segment.id} center={[segment.lat, segment.lng]} radius={0}>
        <Tooltip
          pane="route-length-popup"
          offset={[isLeft ? -15 : 15, 0]}
          direction={isLeft ? "left" : "right"}
          interactive={false}
          permanent={true}>
          <div>
            <Text>map.route_segment.distance_from_prev</Text>:{" "}
            <strong>{segment.distanceFromPrevious} m</strong>
          </div>
          <div>
            <Text>map.route_segment.distance_from_start</Text>:{" "}
            <strong>{segment.distanceFromStart} m</strong>
          </div>
        </Tooltip>
      </CircleMarker>
    );
  });
});

export default RouteSegmentLengthLayer;
