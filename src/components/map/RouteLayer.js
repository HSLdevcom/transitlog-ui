import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import moment from "moment";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import filter from "lodash/filter";
import map from "lodash/map";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";
import StopMarker from "./StopMarker";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";

@inject(app("Time"))
@observer
class RouteLayer extends Component {
  stopTimes = {};
  state = {
    showTime: "arrive",
  };

  onChangeShowTime = (e) => {
    this.setState({
      showTime: e.target.value,
    });
  };

  componentDidMount() {
    const {stops, setMapBounds = () => {}} = this.props;

    if (stops.length === 0) {
      return;
    }

    const bounds = calculateBoundsFromPositions(stops, {
      lat: 60.170988,
      lon: 24.940842,
    });

    setMapBounds(bounds);
  }

  // This method returns hfp positions for when a vehicle
  // was at the requested stop grouped by journey.
  getHfpStopPositions = (positions, stopId) => {
    return map(positions, (journeyPositions) => {
      // Get the hfp positions we're interested in. Now we are working with
      // hfp data that happens before or at the requested stop.
      const stopPos = filter(journeyPositions, (pos) => pos.nextStopId === stopId);

      if (stopPos.length === 0) {
        return [];
      }

      let doorCheckIdx = stopPos.length - 1;
      let firstDoorOpenPos = -1;
      // Loop through the positions in reverse and determine when the doors were
      // opened. The loop breaks when an open door has been found and the current
      // hfp item does not have open doors.
      while (doorCheckIdx >= 0) {
        const pos = stopPos[doorCheckIdx];

        if (pos.drst) {
          // "door status"
          // We're interested in the index of the hfp position when the door was open.
          firstDoorOpenPos = doorCheckIdx;
        } else if (firstDoorOpenPos > -1) {
          // If we have an open door and it's closed now, break out of the loop.
          break;
        }

        doorCheckIdx--;
      }

      // Cut a slice of the hfp data for when the vehicle was at the stop.
      // If the doors were never opened, just return an array of length 1
      // containing the moment before nextStopId was changed to the next stop.
      const sliceStart =
        firstDoorOpenPos !== -1 ? firstDoorOpenPos : stopPos.length - 1;

      return stopPos.slice(sliceStart);
    });
  };

  getArriveDepartTimes = (stopJourneys) => {
    return stopJourneys.map((journeyPositions) => {
      // The last array element is when the vehicle left the stop, ie the
      // moment before the nextStopId prop changed to the next stop.
      const departHfp = journeyPositions[journeyPositions.length - 1];
      const arriveHfp = journeyPositions[0];

      return {arrive: arriveHfp, depart: departHfp};
    });
  };

  getStopTimesForJourney = (stop) => {
    const {
      positionsByJourney,
      state: {selectedJourney},
    } = this.props;

    const selectedJourneyId = getJourneyId(selectedJourney);

    const selectedJourneyPositions = get(
      positionsByJourney.find((j) => j.journeyId === selectedJourneyId),
      "positions",
      []
    );

    return map(
      groupBy(selectedJourneyPositions, "uniqueVehicleId"),
      (positions, uniqueVehicleId) => {
        // Get the hfp positions for when this vehicle was at this stop.
        const stopJourneys = this.getHfpStopPositions([positions], stop.stopId);

        const journeys = this.getArriveDepartTimes(stopJourneys);
        return {vehicleId: uniqueVehicleId, journeys};
      }
    );
  };

  getAllStopTimes = (stop) => {
    const {positionsByVehicle} = this.props;

    // Get existing times from the cache.
    if (Object.keys(this.stopTimes).length > 0) {
      const cachedHfp = get(this, `stopTimes.${stop.stopId}`);

      if (cachedHfp && cachedHfp.length > 0) {
        return cachedHfp;
      }
    }

    const stopHfpGroups = positionsByVehicle.map(({vehicleId, positions}) => {
      const vehicleJourneys = groupBy(positions, "journeyStartTime");
      // Get the hfp positions for when this vehicle was at this stop.
      const stopJourneys = this.getHfpStopPositions(vehicleJourneys, stop.stopId);
      const journeys = this.getArriveDepartTimes(stopJourneys);

      // Return the journeys, grouped by the vehicle ID.
      return {vehicleId, journeys};
    });

    this.stopTimes[stop.stopId] = stopHfpGroups;
    return stopHfpGroups;
  };

  onTimeClick = (receivedAtMoment) => (e) => {
    e.preventDefault();
    this.props.Time.setTime(receivedAtMoment.format("HH:mm:ss"));
  };

  render() {
    const {showTime} = this.state;

    const {state, routePositions, stops} = this.props;
    const {stop: selectedStop, time, date, selectedJourney} = state;

    const timeMoment = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm:ss", true);

    const coords = routePositions.map(([lon, lat]) => [lat, lon]);

    return (
      <React.Fragment>
        <Polyline pane="route-lines" weight={3} positions={coords} />
        {stops.map((stop, index) => {
          const isSelected = stop.nodeId === selectedStop;
          // Funnily enough, the first stop is last in the array.
          const isFirst = index === stops.length - 1;
          // ...and the last stop is first.
          const isLast = index === 0;

          const hfp = selectedJourney
            ? this.getStopTimesForJourney(stop)
            : this.getAllStopTimes(stop);

          return (
            <StopMarker
              onTimeClick={this.onTimeClick}
              onChangeShowTime={this.onChangeShowTime}
              key={`stop_marker_${stop.stopId}`}
              showTime={showTime}
              time={timeMoment}
              selected={isSelected}
              firstTerminal={isFirst}
              lastTerminal={isLast}
              hfp={hfp}
              stop={stop}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

export default RouteLayer;
