import AlertsQuery from "../../queries/AlertsQuery";
import flow from "lodash/flow";
import get from "lodash/get";
import {observer, Observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import React from "react";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";
import SidepanelList from "./SidepanelList";
import AlertsList from "../AlertsList";
import CancellationsQuery from "../../queries/CancellationsQuery";
import CancellationsList from "../CancellationsList";

const decorate = flow(
  observer,
  inject("state")
);

const Alerts = decorate(({state}) => {
  const searchTime = state.date;
  const language = state.language;
  const stop = state.stop;
  const routeId = get(state, "route.routeId", "");
  const direction = get(state, "route.direction", "");

  const isFiltered = stop || routeId;

  const alertSearch = {
    all: true,
  };

  const cancellationsSearch = {
    all: !routeId && !stop,
    routeId: routeId || undefined,
  };

  if (direction) {
    cancellationsSearch.direction = direction;
  }

  return (
    <AlertsQuery time={searchTime} language={language} alertSearch={alertSearch}>
      {({alerts = [], loading: alertsLoading, error: alertsError}) => (
        <CancellationsQuery date={searchTime} cancellationsSearch={cancellationsSearch}>
          {({cancellations = [], loading: cancellationsLoading}) => (
            <Observer>
              {() => {
                const alertsInEffect = !isFiltered
                  ? alerts
                  : getAlertsInEffect(
                      {
                        routeId: routeId || undefined,
                        stopId: stop || undefined,
                        alerts,
                      },
                      state.timeMoment
                    );

                return (
                  <SidepanelList loading={alertsLoading || cancellationsLoading}>
                    {() => (
                      <>
                        <AlertsList
                          showEmptyMessage={true}
                          error={alertsError}
                          helpText="All alerts heading"
                          showListHeading={true}
                          alerts={alertsInEffect}
                        />
                        <CancellationsList
                          showEmptyMessage={!!routeId}
                          helpText="All cancellations heading"
                          showListHeading={true}
                          cancellations={cancellations}
                        />
                      </>
                    )}
                  </SidepanelList>
                );
              }}
            </Observer>
          )}
        </CancellationsQuery>
      )}
    </AlertsQuery>
  );
});

export default Alerts;
