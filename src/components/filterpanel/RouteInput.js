import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import withRoute from "../../hoc/withRoute";

@inject(app("Filters"))
@withRoute
@observer
export class RouteInput extends Component {
  onChange = (e) => {
    const {Filters} = this.props;
    const selectedValue = e.target.value;

    if (!selectedValue) {
      return Filters.setRoute({});
    }

    const [routeId, direction, dateBegin, dateEnd] = selectedValue.split("/");
    Filters.setRoute({routeId, direction, dateBegin, dateEnd});
  };

  render() {
    const {route, routes} = this.props;
    const getRouteValue = (route) =>
      `${route.routeId}/${route.direction}/${route.dateBegin}/${route.dateEnd}`;

    const options = routes.map((route) => {
      const {
        nodeId,
        routeId,
        direction,
        originFi,
        destinationFi,
        dateBegin,
        dateEnd,
      } = route;

      return {
        key: nodeId,
        value: getRouteValue(route),
        label: `${routeId} - suunta ${direction}, ${originFi} - ${destinationFi} (${dateBegin} - ${dateEnd})`,
      };
    });

    options.unshift({value: "", label: "Valitse reitti..."});

    return (
      <select value={getRouteValue(route)} onChange={this.onChange}>
        {options.map(({key, value, label}) => (
          <option key={`route_select_${key}`} value={value}>
            {label}
          </option>
        ))}
      </select>
    );
  }
}
