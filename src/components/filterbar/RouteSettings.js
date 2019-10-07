import React from "react";
import {observer, Observer} from "mobx-react-lite";
import {ControlGroup, ClearButton} from "../Forms";
import Input from "../Input";
import RouteOptionsQuery from "../../queries/RouteOptionsQuery";
import RouteInput, {getFullRoute} from "./RouteInput";
import {text, Text} from "../../helpers/text";
import styled from "styled-components";
import Loading from "../Loading";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import Tooltip from "../Tooltip";
import getTransportType from "../../helpers/getTransportType";
import {SuggestionText, SelectedOptionDisplay, SuggestionAlerts} from "./SuggestionInput";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

const RouteEventsLoading = styled(Loading).attrs({inline: true, size: 20})`
  margin-left: auto;
  position: relative;
  top: 5px;
  right: -10px;
`;

const decorate = flow(
  observer,
  inject("Filters", "Journey")
);

const RouteSettings = decorate(
  ({routeEventsLoading, Filters, Journey, state: {route, date}}) => {
    return (
      <RouteOptionsQuery date={date}>
        {({routes = [], loading}) => (
          <Observer>
            {() => {
              const selectedRoute = getFullRoute(routes, route);

              if (loading) {
                return <LoadingSpinner inline={true} />;
              }

              const alertsInEffect = !selectedRoute
                ? []
                : getAlertsInEffect(selectedRoute, date);

              return (
                <>
                  <ControlGroup>
                    <Input
                      helpText="Select route"
                      label={text("filterpanel.find_line_route")}
                      animatedLabel={false}>
                      <RouteInput route={route} routes={routes} />
                    </Input>
                    {route && route.routeId && (
                      <Tooltip>
                        <ClearButton
                          helpText={text("filterpanel.remove_route")}
                          onClick={() => {
                            Filters.setRoute({
                              routeId: "",
                              direction: "",
                              originStopId: "",
                            });

                            Journey.setSelectedJourney(null);
                          }}
                        />
                      </Tooltip>
                    )}
                  </ControlGroup>
                  {selectedRoute && (
                    <SelectedOptionDisplay
                      data-testid="selected-route-display"
                      withIcon={true}
                      className={getTransportType(selectedRoute.routeId || "")}>
                      <SuggestionText withIcon={true}>
                        <strong>{selectedRoute.routeId}</strong>{" "}
                        <Text>domain.direction</Text> {selectedRoute.direction}
                        <br />
                        {selectedRoute.origin} - {selectedRoute.destination}
                      </SuggestionText>
                      {routeEventsLoading && <RouteEventsLoading />}
                      {alertsInEffect.length !== 0 && (
                        <SuggestionAlerts alerts={alertsInEffect} />
                      )}
                    </SelectedOptionDisplay>
                  )}
                </>
              );
            }}
          </Observer>
        )}
      </RouteOptionsQuery>
    );
  }
);

export default RouteSettings;
