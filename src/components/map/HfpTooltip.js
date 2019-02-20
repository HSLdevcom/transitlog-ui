import React, {Component} from "react";
import {Tooltip} from "react-leaflet";
import moment from "moment-timezone";
import {observer} from "mobx-react";
import {Text} from "../../helpers/text";
import {TIMEZONE} from "../../constants";

@observer
class HfpTooltip extends Component {
  prevPosition = null;

  render() {
    const {
      position,
      permanent = false,
      sticky = true,
      direction = "left",
      offset = [-25, 0],
    } = this.props;
    let usePosition = position || this.prevPosition;

    if (!usePosition) {
      return null;
    }

    if (position) {
      this.prevPosition = position;
    }

    return (
      <Tooltip
        sticky={sticky}
        permanent={permanent}
        offset={offset}
        direction={direction}>
        <strong>
          {usePosition.route_id} / {usePosition.direction_id}
        </strong>
        <br />
        {moment.tz(usePosition.tst, TIMEZONE).format("YYYY-MM-DD HH:mm:ss")}
        <br />
        {usePosition.unique_vehicle_id}
        <br />
        <Text>vehicle.next_stop</Text>: {usePosition.next_stop_id}
        <br />
        <Text>vehicle.speed</Text>: {Math.round((usePosition.spd * 18) / 5)} km/h
        <br />
        DL: {usePosition.dl}
      </Tooltip>
    );
  }
}

export default HfpTooltip;
