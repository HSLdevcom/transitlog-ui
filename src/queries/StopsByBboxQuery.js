import React, {useRef} from "react";
import {observer} from "mobx-react-lite";
import get from "lodash/get";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import {AlertFieldsFragment} from "./AlertFieldsFragment";

export const stopsByBboxQuery = gql`
  query stopsByBboxQuery($bbox: PreciseBBox!) {
    stopsByBbox(bbox: $bbox) {
      id
      stopId
      shortId
      lat
      lng
      name
      radius
      modes
      alerts {
        ...AlertFieldsFragment
      }
    }
  }
  ${AlertFieldsFragment}
`;

let currentlyFetching = "";

const StopsByBboxQuery = observer((props) => {
  const {children, bbox, skip} = props;
  const prevResult = useRef([]);

  if (currentlyFetching === bbox) {
    return children({stops: prevResult.current, loading: false});
  }

  currentlyFetching = bbox;

  return (
    <Query skip={skip} query={stopsByBboxQuery} variables={{bbox}} partialRefetch={true}>
      {({loading, data, error}) => {
        if (loading) return children({stops: prevResult.current, loading: true});
        if (error) return children({stops: prevResult.current, loading: false});

        const stops = get(data, "stopsByBbox", []);
        // Stop the stops from disappearing while loading
        if (stops.length !== 0) {
          prevResult.current = stops;
        }

        return children({
          stops: prevResult.current,
          loading: false,
        });
      }}
    </Query>
  );
});

export default StopsByBboxQuery;
