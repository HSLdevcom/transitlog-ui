import {observer, inject} from "mobx-react";
import {observable, action} from "mobx";
import {app} from "mobx-app";
import React from "react";
import {getCachedData, cacheData, getCacheKey} from "../helpers/hfpCache";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import get from "lodash/get";
import HfpQuery from "../queries/HfpQuery";
import takeEveryNth from "../helpers/takeEveryNth";
import withRoute from "./withRoute";
import getJourneyId from "../helpers/getJourneyId";

const formatData = (hfpData) => {
  if (hfpData.length === 0) {
    return hfpData;
  }

  return (
    takeEveryNth(hfpData, 3) // Take every other hfp item.
      // Some HFP items are null for one reason or another. Filter those out.
      .filter((pos) => !!pos && !!pos.lat && !!pos.long)
  );
};

const getGroupedByVehicle = (hfpData) => {
  if (hfpData.length === 0) {
    return hfpData;
  }

  const groupedData = groupBy(hfpData, "uniqueVehicleId");
  const vehicleGroups = map(groupedData, (positions, groupName) => ({
    vehicleId: groupName,
    positions,
  }));

  return vehicleGroups;
};

const getGroupedByJourney = (hfpData) => {
  if (hfpData.length === 0) {
    return hfpData;
  }

  const groupedData = groupBy(hfpData, getJourneyId);
  const journeyGroups = map(groupedData, (positions, journeyId) => ({
    journeyId: journeyId,
    positions,
  }));

  return journeyGroups;
};

@observer
class HfpLoader extends React.Component {
  render() {
    const {children, route, date, cachedHfp = []} = this.props;

    return cachedHfp.length === 0 ? (
      <HfpQuery route={route} date={date}>
        {({hfpPositions, loading}) => {
          if (loading || hfpPositions.length === 0) {
            return children({
              positionsByVehicle: [],
              positionsByJourney: [],
              loading,
            });
          }

          const formattedPositions = formatData(hfpPositions);
          cacheData(formattedPositions, date, route);

          const positionsByVehicle = getGroupedByVehicle(formattedPositions);
          const positionsByJourney = getGroupedByJourney(formattedPositions);

          return children({positionsByVehicle, positionsByJourney, loading});
        }}
      </HfpQuery>
    ) : (
      children({
        positionsByVehicle: getGroupedByVehicle(cachedHfp),
        positionsByJourney: getGroupedByJourney(cachedHfp),
        loading: false,
      })
    );
  }
}

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    constructor() {
      super();
      this.cachedHfp = observable.map({}, {deep: false});
    }

    componentDidMount() {
      this.updateComponentCache();
    }

    componentDidUpdate() {
      this.updateComponentCache();
    }

    async updateComponentCache() {
      const {
        state: {date},
        route,
      } = this.props;

      if (!route || !get(route, "routeId", "")) {
        return;
      }

      const cacheKey = getCacheKey(date, route);

      if (cacheKey) {
        const existingCache = this.cachedHfp.get(cacheKey);

        if (!existingCache) {
          const cachedHfp = await getCachedData(date, route);
          this.setCachedHfp(cachedHfp, cacheKey);
        }
      }
    }

    @action
    setCachedHfp(data, key) {
      this.cachedHfp.set(key, data);
    }

    render() {
      const {
        state: {date},
        route,
      } = this.props;

      const cacheKey = getCacheKey(date, route);
      const cachedPositions = !cacheKey ? [] : this.cachedHfp.get(cacheKey);

      return (
        <HfpLoader cachedHfp={cachedPositions} date={date} route={route}>
          {({positionsByVehicle, positionsByJourney, loading}) => (
            <Component
              {...this.props}
              loading={loading}
              positionsByVehicle={positionsByVehicle}
              positionsByJourney={positionsByJourney}
            />
          )}
        </HfpLoader>
      );
    }
  }

  return WithHfpData;
};
