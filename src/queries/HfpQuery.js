import React, {Component} from "react";
import {hfpClient} from "../api";
import get from "lodash/get";
import {Query} from "react-apollo";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import withRoute from "../hoc/withRoute";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";

export const hfpQuery = gql`
  query hfpQuery($routeId: String, $direction: Int, $date: Date) {
    allVehicles(
      orderBy: RECEIVED_AT_ASC
      condition: {routeId: $routeId, directionId: $direction, oday: $date}
    ) {
      nodes {
        ...HfpFieldsFragment
      }
    }
  }
  ${HfpFieldsFragment}
`;

@inject(app("Filters"))
@withRoute
@observer
class HfpQuery extends Component {
  static propTypes = {
    route: PropTypes.shape({
      routeId: PropTypes.string,
      direction: PropTypes.string,
      dateBegin: PropTypes.string,
      dateEnd: PropTypes.string,
    }).isRequired,
    stopId: PropTypes.string,
    date: PropTypes.string,
    children: PropTypes.func.isRequired,
  };

  render() {
    const {route, children, date} = this.props;
    const {routeId, direction} = route;

    return (
      <Query
        client={hfpClient}
        query={hfpQuery}
        fetchPolicy="cache-first"
        variables={{
          routeId,
          direction: parseInt(direction, 10),
          date,
        }}>
        {({loading, error, data}) => {
          let hfpPositions = get(data, "allVehicles.nodes", []);
          return children({hfpPositions, loading, error});
        }}
      </Query>
    );
  }
}

export default HfpQuery;
