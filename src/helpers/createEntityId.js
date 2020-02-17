export function createEntityId(obj) {
  switch (obj.__typename) {
    case "Stop":
      return `${obj.__typename}_${obj.stopId}`;
    case "vehicles":
      if (Object.keys(obj).length <= 3) {
        return `vehicle_option_${obj.unique_vehicle_id}`;
      }

      return `${obj.__typename}_${obj.journey_start_time}_${obj.route_id}_${obj.direction_id}_${obj.received_at}_${obj.lat}_${obj.long}_${obj.unique_vehicle_id}`;
    case "Line":
      return `${obj.__typename}_${obj.lineId}_${obj.dateBegin}_${obj.dateEnd}`;
    case "Route":
      return `${obj.__typename}_${obj.routeId}_${obj.direction}_${obj.dateBegin}_${obj.dateEnd}`;
    case "RouteSegment":
      return `${obj.__typename}_${obj.routeId}_${obj.direction}_${obj.dateBegin}_${obj.dateEnd}_${obj.stop}`;
    case "Departure":
      return `${obj.__typename}_${obj.routeId}_${obj.direction}_${obj.dateBegin}_${obj.dateEnd}_${obj.hours}_${obj.minutes}_${obj.stopId}_${obj.dayType}`;
    default:
      console.log(obj.__typename);
      return;
  }
}
