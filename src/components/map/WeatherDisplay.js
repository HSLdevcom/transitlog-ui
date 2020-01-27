import {observer} from "mobx-react-lite";
import React, {useMemo} from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import get from "lodash/get";
import compact from "lodash/compact";
import {inject} from "../../helpers/inject";
import {useWeather} from "../../hooks/useWeather";
import {getRoadStatus, getClosestTimeValue} from "../../hooks/useWeatherData";
import {CircleMarker, Tooltip} from "react-leaflet";
import {latLng} from "leaflet";
import {text, Text} from "../../helpers/text";

const TooltipText = styled.div`
  font-family: var(--font-family);
  font-size: 1.2em;
  font-weight: 700;
  color: var(--blue);
`;

const decorate = flow(observer, inject("state"));

const WeatherMarker = ({children, location, color}) => (
  <CircleMarker
    className="test-class-weather-marker"
    radius={7}
    fill={true}
    fillColor={color}
    fillOpacity={1}
    stroke={false}
    center={location}>
    <Tooltip offset={[10, 0]}>{children}</Tooltip>
  </CircleMarker>
);

const WeatherDisplay = decorate(({state}) => {
  const {date, unixTime} = state;
  const {weather, roadCondition} = useWeather(date);

  const [weatherLocations, roadLocations] = useMemo(() => {
    const weatherLocations = compact(get(weather, "locations", [])).map((location) => {
      const locationData = get(location, "data.t2m.timeValuePairs", []);

      if (!location || !locationData || locationData.length === 0) {
        return null;
      }

      return {
        data: locationData,
        id: get(location, "info.id", ""),
        location: latLng(get(location, "info.position", []).map((c) => parseFloat(c))),
      };
    });

    const roadLocations = get(roadCondition, "locations", []).map((location) => {
      if (!location) {
        return null;
      }

      const roadStatus = getRoadStatus([location], unixTime);
      return {
        data: roadStatus,
        id: get(location, "info.id", ""),
        location: latLng(get(location, "info.position", []).map((c) => parseFloat(c))),
      };
    });

    return [weatherLocations, roadLocations];
  }, [weather, roadCondition]);

  return (
    <>
      {weatherLocations &&
        weatherLocations.length !== 0 &&
        weatherLocations.map((weatherLocation) => {
          if (!weatherLocation || !weatherLocation.location) {
            return null;
          }

          let temp = getClosestTimeValue(weatherLocation.data, unixTime);
          const value = get(temp, "value", 0);

          temp = isNaN(value)
            ? text("general.no_data")
            : Math.round(value * 10) / 10 + " &deg;C";

          return (
            <WeatherMarker
              key={`weather_marker_${weatherLocation.id}`}
              color="var(--light-blue)"
              location={weatherLocation.location}>
              <TooltipText dangerouslySetInnerHTML={{__html: temp}} />
            </WeatherMarker>
          );
        })}
      {roadLocations &&
        roadLocations.length !== 0 &&
        roadLocations.map((roadLocation) => {
          if (!roadLocation || !roadLocation.location) {
            return null;
          }

          return (
            <WeatherMarker
              color="var(--light-grey)"
              location={roadLocation.location}
              key={`road_marker_${roadLocation.id}`}>
              <TooltipText>
                <Text>map.road</Text>: {roadLocation.data || text("general.no_data")}
              </TooltipText>
            </WeatherMarker>
          );
        })}
    </>
  );
});

export default WeatherDisplay;
