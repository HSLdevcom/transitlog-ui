import React, {Component} from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import {Query} from "react-apollo";
import gql from "graphql-tag";

const stopsByBboxQuery = gql`
  query stopsByBboxQuery(
    $minLat: Float!
    $minLon: Float!
    $maxLat: Float!
    $maxLon: Float!
    $date: Date!
  ) {
    stopsByBbox(minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon) {
      nodes {
        stopId
        shortId
        nameFi
        lat
        lon
        routeSegmentsForDate(date: $date) {
          nodes {
            line {
              nodes {
                lineId
                dateBegin
                dateEnd
              }
            }
            routeId
            dateBegin
            dateEnd
            direction
          }
        }
      }
    }
  }
`;

@observer
class StopsByBboxQuery extends Component {
  prevQueryResult = [];

  render() {
    const {children, variables} = this.props;

    return (
      <Query query={stopsByBboxQuery} variables={variables}>
        {({loading, data, error}) => {
          if (loading) return children({stops: this.prevQueryResult, loading: true});
          if (error) return children({stops: this.prevQueryResult, loading: false});
          const stops = get(data, "stopsByBbox.nodes", []);

          // Stop the stops from disappearing while loading
          this.prevQueryResult = stops;

          return children({stops, loading: false});
        }}
      </Query>
    );
  }
}

export default StopsByBboxQuery;
