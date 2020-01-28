import React from "react";
import {observer} from "mobx-react-lite";
import get from "lodash/get";
import {useQueryData} from "../hooks/useQueryData";
import {singleStopQuery} from "../components/map/StopLayer";

export const withStop = (Component) =>
  observer((props) => {
    const stopId = get(props, "stopId", get(props, "state.stop"));
    const date = get(props, "date", get(props, "state.date"));

    const {data: selectedStop, loading} = useQueryData(
      singleStopQuery,
      {
        skip: !stopId,
        variables: {
          stopId,
          date,
        },
      },
      "single stop query"
    );

    return <Component {...props} stop={selectedStop} stopLoading={loading} />;
  });
