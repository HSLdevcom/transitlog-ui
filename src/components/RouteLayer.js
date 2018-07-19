import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import distanceBetween from "../helpers/distanceBetween";
import moment from "moment";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";

const timetable = gql`
  {
    allDepartures(
      condition: {
        stopId: "1362148"
        routeId: "1078N"
        dateBegin: "2018-06-18"
        dateEnd: "2018-08-12"
        dayType: "Ma"
      }
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
              <Query query={timetable}>
                {({loading, error, data}) => {
                  const schedule = get(data, "allDepartures.nodes", []);
                  if (loading || error || schedule.length === 0) return null;
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
