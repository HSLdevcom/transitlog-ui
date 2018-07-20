import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import distanceBetween from "../helpers/distanceBetween";
import moment from "moment";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";

// expired timetables not available in jore
const timetable = gql`
  query stopDepartures($stopId: String!, $routeId: String!) {
    allDepartures(
      condition: {
        stopId: $stopId
        routeId: $routeId
        dayType: "Ma"
        dateBegin: "2018-06-25"
        dateEnd: "2018-07-22"
      }
      orderBy: DEPARTURE_ID_ASC
    ) {
      nodes {
        stopId
        routeId
        departureId
        hours
        minutes
        dateBegin
        dateEnd
        dayType
      }
    }
  }
`;

class RouteLayer extends Component {
  coords = this.props.positions.map(([lon, lat]) => [lat, lon]);

  stops = this.props.stops.reduce((stops, {stop}) => {
    const {lat: stopLat, lon: stopLng} = stop;
    const firstHfp = this.props.hfpPositions[0];
    let hfp;

    if (firstHfp) {
      const initialClosest = {
        pos: firstHfp,
        distance: distanceBetween(stopLat, stopLng, firstHfp.lat, firstHfp.long),
      };

      hfp = this.props.hfpPositions.reduce((closest, pos) => {
        if (closest.distance < 0.005) {
          return closest;
        }

        const {lat: posLat, long: posLng} = pos;

        const distance = distanceBetween(stopLat, stopLng, posLat, posLng);
        return distance < closest.distance
          ? {
              distance,
              pos,
            }
          : closest;
      }, initialClosest);
    }

    const hfpStop = {
      ...stop,
      hfp: hfp ? hfp.pos : null,
    };

    stops.push(hfpStop);
    return stops;
  }, []);

  render() {
    const {route} = this.props;
    return (
      <React.Fragment>
        <Polyline weight={3} positions={this.coords} />
        {this.stops.map((stop) => (
          <CircleMarker
            key={`stop_marker_${stop.stopId}`}
            center={[stop.lat, stop.lon]}
            color="#3388ff"
            fill={true}
            fillColor="#3388ff"
            fillOpacity={1}
            radius={6}>
            <Popup>
              <Query query={timetable} variables={{...route, stopId: stop.stopId}}>
                {({loading, error, data}) => {
                  const schedule = get(data, "allDepartures.nodes", []);
                  console.log(stop.stopId);
                  if (loading || error || schedule.length === 0) return null;
                  console.log("foo", schedule);
                  return (
                    <React.Fragment>
                      {stop.nameFi}, {stop.shortId.replace(/ /g, "")},{" "}
                      {schedule.map(({hours, minutes}) => [
                        hours,
                        ":",
                        minutes,
                        <br />,
                      ])}
                      {!!stop.hfp && (
                        <React.Fragment>
                          <br />
                          Drive-by time:{" "}
                          {moment(stop.hfp.receivedAt).format("HH:mm:ss")}
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  );
                }}
              </Query>
            </Popup>
          </CircleMarker>
        ))}
      </React.Fragment>
    );
  }
}

export default RouteLayer;
