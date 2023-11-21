import React from "react";
import L from "leaflet";
import {observer} from "mobx-react-lite";
import StopLayer from "./StopLayer";
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
import {inject} from "../../helpers/inject";
import WeatherDisplay from "./WeatherDisplay";
import JourneyStopsLayer from "./JourneyStopsLayer";
import {WeatherWidget} from "./WeatherWidget";
import UnsignedEventsLayer from "./UnsignedEventsLayer";
import JourneyEventsLayer from "./JourneyEventsLayer";
import DriverEventLayer from "./DriverEventLayer";
import RouteEventsLayer from "./RouteEventsLayer";
import TerminalLayer from "./TerminalLayer";
import RouteSegmentLengthLayer from "./RouteSegmentLengthLayer";
import {Marker} from "react-leaflet";

const decorate = flow(observer, inject("state"));

const MapContent = decorate(
  ({
    journeys = [],
    journeyPositions,
    route,
    centerOnRoute = true,
    state: {
      selectedJourney,
      date,
      mapOverlays,
      areaEventsStyle,
      areaSearchRangeMinutes,
      mapView,
      mapZoom,
      locationMarker,
    },
  }) => {
    const hasRoute = !!route && !!route.routeId;
    const showStopRadius = expr(() => mapOverlays.indexOf("Stop radius") !== -1);

    const selectedJourneyId = getJourneyId(selectedJourney);

    const myIcon = L.icon({
      iconUrl: require("../../icons/location-pin.svg"),
      iconSize: [30, 30],
    });

    return (
      <>
        <AreaSelect enabled={mapZoom > 12 && areaSearchRangeMinutes} />
        <StopLayer showRadius={showStopRadius} date={date} />
        {locationMarker && <Marker icon={myIcon} position={locationMarker} />}
        <TerminalLayer />
        {hasRoute && (
          <>
            <RouteLayer
              canCenterOnRoute={centerOnRoute}
              isTrunkRoute={route.trunkRoute}
            />

            {mapOverlays.includes("Route segment length") && <RouteSegmentLengthLayer />}

            {(!selectedJourneyId ||
              journeys.length === 0 ||
              !journeys.find((journey) => selectedJourneyId === journey.id)) && (
              <RouteStopsLayer
                showRadius={showStopRadius}
                isTrunkRoute={route.trunkRoute}
              />
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

            <RouteEventsLayer
              key={`route_hfp_markers_${route.routeId}_${route.direction}`}
            />
          </>
        )}

        <UnsignedEventsLayer />

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
        <DriverEventLayer />
        {mapOverlays.includes("Weather") && (
          <WeatherDisplay key="weather_map" position={mapView} />
        )}
        {mapOverlays.includes("Weather") && (
          <WeatherWidget key="map_weather" position={mapView} />
        )}
      </>
    );
  }
);

export default MapContent;
