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
    $date: Date
  ) {
    stopsByBbox(minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon) {
      nodes {
        stopId
        lat
        lon
        routeSegmentsForDate(date: $date) {
          nodes {
            line {
              nodes {
                lineId
                dateBegin
                dateEnd
                routes {
                  nodes {
                    routeId
                    direction
                    nameFi
                    dateBegin
                    dateEnd
                    originstopId
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const stopColor = "#3388ff";

class StopLayer extends Component {
  onClickRoute = ({line, route}) => (e) => {
    const {onLineSelected, onRouteSelected} = this.props;

    onLineSelected(line);
    onRouteSelected(route);
  };

  render() {
    const {queryDate} = this.props;

    return (
      <Query query={stopsByBboxQuery} variables={this.props.bounds}>
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
                  fillColor={stopColor}
                  fillOpacity={1}
                  radius={6}>
                  <Popup>
                    {get(stop, "routeSegmentsForDate.nodes", []).map(({line}) =>
                      get(line, "nodes", []).map(
                        ({lineId, dateBegin, dateEnd, routes}) => (
                          <div key={`stop_popup_line_${stop.stopId}_${lineId}`}>
                            <strong>{lineId}</strong>
                            <div>
                              {get(routes, "nodes", []).map((route) => (
                                <button
                                  key={`stop_route_${stop.stopId}_${route.routeId}_${
                                    route.dateBegin
                                  }_${route.direction}`}
                                  onClick={this.onClickRoute({
                                    line: {lineId, dateBegin, dateEnd},
                                    route,
                                  })}>
                                  {route.routeId}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      )
                    )}
                  </Popup>
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
