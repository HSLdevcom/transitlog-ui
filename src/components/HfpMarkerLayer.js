import React, {Component} from "react";
import {CircleMarker, Tooltip} from "react-leaflet";
import get from "lodash/get";
import moment from "moment";
import {darken} from "polished";
import {getColor} from "../helpers/vehicleColor";

class HfpMarkerLayer extends Component {
  prevQueryTime = "";
  prevHfpPosition = null;
  prevPositionIndex = 0;

  getHfpPosition = () => {
    const {positions, queryDate, queryTime} = this.props;

    if (!queryTime || queryTime === this.prevQueryTime) {
      return this.prevHfpPosition;
    }

    const queryTimeMoment = moment(
      `${queryDate} ${queryTime}`,
      "YYYY-MM-DD HH:mm:ss",
      true
    );

    let nextHfpPosition = null;
    const total = positions.length;
    let posIdx = this.prevPositionIndex < total ? this.prevPositionIndex : 0;

    for (; posIdx < total; posIdx++) {
      const position = positions[posIdx];
      let prevDifference = 30;

      if (nextHfpPosition) {
        prevDifference = Math.abs(
          queryTimeMoment.diff(moment(nextHfpPosition.receivedAt), "seconds")
        );

        if (prevDifference < 5) {
          break;
        }
      }

      const difference = Math.abs(
        queryTimeMoment.diff(moment(position.receivedAt), "seconds")
      );

      if (difference < prevDifference) {
        nextHfpPosition = position;
      }
    }

    this.prevHfpPosition = nextHfpPosition;
    this.prevQueryTime = queryTime;

    return nextHfpPosition;
  };

  onMarkerClick = (positionWhenClicked) => () => {
    const {onMarkerClick, selectedVehicle} = this.props;

    onMarkerClick(
      get(selectedVehicle, "uniqueVehicleId", null) !==
      positionWhenClicked.uniqueVehicleId
        ? positionWhenClicked
        : null
    );
  };

  render() {
    const {name} = this.props;
    const color = getColor(name);

    const position = this.getHfpPosition();

    if (!position) {
      return null;
    }

    return (
      <React.Fragment>
        <CircleMarker
          onClick={this.onMarkerClick(position)}
          center={[position.lat, position.long]}
          fillColor={color}
          fillOpacity={1}
          weight={3}
          radius={12}
          pane="hfp-markers"
          color={darken(0.2, color)}>
          <Tooltip>
            {moment(position.receivedAt).format("HH:mm:ss")}
            <br />
            {name}
          </Tooltip>
        </CircleMarker>
      </React.Fragment>
    );
  }
}

export default HfpMarkerLayer;
