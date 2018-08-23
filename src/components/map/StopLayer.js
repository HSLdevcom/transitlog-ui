import React, {Component} from "react";
import {CircleMarker, Popup} from "react-leaflet";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";

const stopsByBboxQuery = gql`
  query stopsByBboxQuery(
    $minLat: Float!
    $minLon: Float!
    $maxLat: Float!
    $maxLon: Float!
  ) {
    stopsByBbox(minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon) {
      nodes {
        stopId
        lat
        lon
      }
    }
  }
`;

const stopColor = "#3388ff";
const selectedStopColor = "#33ff88";

class StopLayer extends Component {
  render() {
    const {selectedStop, bounds} = this.props;

    return (
      <Query query={stopsByBboxQuery} variables={bounds}>
        {({loading, data, error}) => {
          if (loading) return "Loading...";
          if (error) return "Error!";
          const stops = get(data, "stopsByBbox.nodes", []);
          return (
            <React.Fragment>
              {stops.map((stop) => (
                <CircleMarker
                  key={`stops_${stop.stopId}`}
                  pane="stops"
                  center={[stop.lat, stop.lon]}
                  color={stopColor}
                  fillColor={
                    selectedStop === stop.stopId ? selectedStopColor : stopColor
                  }
                  fillOpacity={1}
                  radius={selectedStop === stop.stopId ? 10 : 6}>
                  <Popup>Timetable of the day</Popup>
                </CircleMarker>
              ))}
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

export default StopLayer;
