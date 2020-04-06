import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import SingleRouteQuery from "../queries/SingleRouteQuery";
import flow from "lodash/flow";
import get from "lodash/get";
import {inject} from "../helpers/inject";
import {createRouteId} from "../helpers/keys";

const decorate = flow(observer, inject("Filters"));

export const withRoute = (Component) =>
  decorate((props) => {
    const {state, route} = props;

    const date = get(props, "date", get(props, "state.date", ""));
    const routeId = get(route, "routeId", get(state, "route.routeId", ""));
    const direction = get(route, "direction", get(state, "route.direction", ""));

    const onCompleted = useCallback(
      ({route: fetchedRoute}) => {
        if (
          createRouteId(fetchedRoute) === createRouteId(state.route) &&
          (!state.route.originStopId ||
            fetchedRoute.originStopId !== state.route.originStopId)
        ) {
          props.Filters.setRoute(fetchedRoute);
        }
      },
      [props.Filters]
    );

    return (
      <SingleRouteQuery
        routeId={routeId}
        direction={direction}
        date={date}
        onCompleted={onCompleted}>
        {({route, loading}) => (
          <Component {...props} route={route} routeLoading={loading} />
        )}
      </SingleRouteQuery>
    );
  });
