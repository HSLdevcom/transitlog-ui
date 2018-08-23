import React from "react";
import SingleRouteQuery from "../queries/SingleRouteQuery";
import {observer} from "mobx-react";
import get from "lodash/get";

export default (Component) =>
  observer((props) => {
    // Get the route id from the immediate props or from state.
    const route = get(
      props,
      "route",
      get(props, "state.route", {routeId: "", direction: ""})
    );

    if (!get(route, "routeId", "")) {
      return <Component {...props} route={route} />;
    }

    if (route && route.routeId && route.direction && route.dateBegin) {
      return <Component {...props} route={route} />;
    }

    return (
      <SingleRouteQuery route={route}>
        {({route: routeObj, loading, error}) => {
          if (error || loading) {
            return <Component {...props} route={route} />;
          }

          return <Component {...props} route={routeObj} />;
        }}
      </SingleRouteQuery>
    );
  });
