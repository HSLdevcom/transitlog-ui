import React from "react";
import {Tooltip, CircleMarker} from "react-leaflet";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import {useQueryData} from "../../hooks/useQueryData";
import {Text} from "../../helpers/text";
import {routeStopsQuery} from "../../queries/StopsByRouteQuery";
import get from "lodash/get";

const decorate = flow(observer, inject("UI"));

const RouteSegmentLengthLayer = decorate(({state}) => {
  const {route, date} = state;

  const {data: routeStops} = useQueryData(
    routeStopsQuery,
    {
      skip: !route || !route.routeId,
      variables: {
        routeId: get(route, "routeId"),
        direction: get(route, "direction"),
        date,
      },
    },
    "route geometry query"
  );

  let stops = routeStops || [];

  return stops.map((stop, idx) => {
    if (idx === 0) {
      // Skip first stop. It has no useful information.
      return null;
    }

    let isLeft = idx % 2 === 0;
    let route = stop.routes[0];

    return (
      <CircleMarker key={stop.id} center={[stop.lat, stop.lng]} radius={0}>
        <Tooltip
          pane="route-length-popup"
          offset={[isLeft ? -15 : 15, 0]}
          direction={isLeft ? "left" : "right"}
          interactive={false}
          permanent={true}>
          <div>
            <Text>map.route_segment.distance_from_prev</Text>:{" "}
            <strong>{route.distanceFromPrevious || 0} m</strong>
          </div>
          <div>
            <Text>map.route_segment.distance_from_start</Text>:{" "}
            <strong>{route.distanceFromStart || 0} m</strong>
          </div>
        </Tooltip>
      </CircleMarker>
    );
  });
});

export default RouteSegmentLengthLayer;
