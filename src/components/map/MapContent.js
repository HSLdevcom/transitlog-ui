import React, {useMemo} from "react";
import {observer} from "mobx-react-lite";
import StopLayer from "./StopLayer";
import RouteGeometryQuery from "../../queries/RouteGeometryQuery";
import RouteLayer from "./RouteLayer";
import flow from "lodash/flow";
import getJourneyId from "../../helpers/getJourneyId";
import JourneyLayer from "./JourneyLayer";
import HfpMarkerLayer from "./HfpMarkerLayer";
import RouteStopsLayer from "./RouteStopsLayer";
import AreaSelect from "./AreaSelect";
import {expr} from "mobx-utils";
import {areaEventsStyles} from "../../stores/UIStore";
import SimpleHfpLayer from "./SimpleHfpLayer";
import {createRouteId} from "../../helpers/keys";
import {inject} from "../../helpers/inject";
import WeatherDisplay from "./WeatherDisplay";
import JourneyStopsLayer from "./JourneyStopsLayer";
import {WeatherWidget, JourneyWeatherWidget} from "./WeatherWidget";
import get from "lodash/get";
import UnsignedEventsLayer from "./UnsignedEventsLayer";
import JourneyEventsLayer from "./JourneyEventsLayer";

const decorate = flow(
  observer,
  inject("state")
);

const MapContent = decorate(
  ({
    journeys = [],
    routeJourneys = [],
    journeyPositions,
    unsignedEvents,
    route,
    stop,
    centerOnRoute = true,
    state: {
      selectedJourney,
      date,
      mapOverlays,
      areaEventsStyle,
      unixTime,
      areaSearchRangeMinutes,
      mapView,
      mapZoom,
    },
  }) => {
    const hasRoute = !!route && !!route.routeId;
    const showStopRadius = expr(() => mapOverlays.indexOf("Stop radius") !== -1);

    const selectedJourneyId = getJourneyId(selectedJourney);
    const selectedJourneyEvents = useMemo(
      () => get(journeys.find((j) => j.id === selectedJourneyId) || {}, "events", []),
      [selectedJourneyId, journeys.length !== 0]
    );

    return (
      <>
        <AreaSelect enabled={mapZoom > 12 && areaSearchRangeMinutes} />
        {/* When a route is NOT selected... */}
        <StopLayer showRadius={showStopRadius} date={date} selectedStop={stop} />
        {/* When a route IS selected... */}
        {hasRoute && (
          <>
            <RouteGeometryQuery
              key={`route_query_${createRouteId(route, true)}`}
              route={route}
              date={date}>
              {({routeGeometry = null}) =>
                routeGeometry && routeGeometry.coordinates.length !== 0 ? (
                  <RouteLayer
                    routeId={
                      routeGeometry.coordinates.length !== 0 ? createRouteId(route) : null
                    }
                    mode={routeGeometry.mode || "BUS"}
                    coordinates={routeGeometry.coordinates}
                    canCenterOnRoute={centerOnRoute}
                    key={`route_line_${createRouteId(route, true)}`}
                  />
                ) : null
              }
            </RouteGeometryQuery>

            {(!selectedJourneyId ||
              journeys.length === 0 ||
              !journeys.find((journey) => selectedJourneyId === journey.id)) && (
              <RouteStopsLayer showRadius={showStopRadius} route={route} />
            )}

            {journeys.length !== 0 &&
              journeys.map((journey) => {
                const isSelectedJourney = selectedJourneyId === journey.id;

                if (!isSelectedJourney) {
                  return null;
                }

                const currentPosition = journeyPositions
                  ? journeyPositions.get(journey.id)
                  : null;

                return [
                  <JourneyLayer
                    key={`journey_line_${journey.id}`}
                    journey={journey}
                    name={journey.id}
                  />,
                  <JourneyStopsLayer
                    showRadius={showStopRadius}
                    key={`journey_stops_${journey.id}`}
                    journey={journey}
                  />,
                  <JourneyEventsLayer
                    key={`journey_map_events_${journey.id}`}
                    journey={journey}
                  />,
                  currentPosition ? (
                    <HfpMarkerLayer
                      key={`hfp_markers_${journey.id}`}
                      currentEvent={currentPosition}
                      journey={journey}
                      isSelectedJourney={isSelectedJourney}
                    />
                  ) : null,
                ];
              })}
            {routeJourneys.length !== 0 &&
              routeJourneys
                .filter(({id}) => id !== selectedJourneyId)
                .map((journey) => {
                  const event = journeyPositions.get(journey.id);

                  if (!event) {
                    return null;
                  }

                  return (
                    <HfpMarkerLayer
                      key={`hfp_markers_${journey.id}`}
                      currentEvent={event}
                      journey={journey}
                      isSelectedJourney={false}
                    />
                  );
                })}
          </>
        )}
        {!selectedJourney && unsignedEvents && unsignedEvents.length !== 0 && (
          <UnsignedEventsLayer unsignedEvents={unsignedEvents} />
        )}
        {journeys.length !== 0 &&
          journeys
            .filter(({id}) => id !== selectedJourneyId)
            .map((journey) => {
              if (areaEventsStyle === areaEventsStyles.MARKERS) {
                const event = journeyPositions.get(journey.id);

                if (!event) {
                  return null;
                }

                return (
                  <HfpMarkerLayer
                    key={`hfp_markers_${journey.id}`}
                    currentEvent={event}
                    journey={journey}
                    isSelectedJourney={false}
                  />
                );
              }

              return (
                <SimpleHfpLayer
                  zoom={mapZoom}
                  name={journey.id}
                  key={`hfp_polyline_${journey.id}`}
                  events={journey.vehiclePositions}
                />
              );
            })}
        {mapOverlays.includes("Weather") && (
          <WeatherDisplay key="weather_map" position={mapView} />
        )}
        {mapOverlays.includes("Weather") &&
          (!selectedJourneyId ? (
            <WeatherWidget key="map_weather" position={mapView} />
          ) : (
            <JourneyWeatherWidget
              time={unixTime}
              key={`journey_weather_${selectedJourneyId}`}
              events={selectedJourneyEvents}
            />
          ))}
      </>
    );
  }
);

export default MapContent;
