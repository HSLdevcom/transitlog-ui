import React, {useRef} from "react";
import {Tooltip} from "react-leaflet";
import moment from "moment-timezone";
import {observer} from "mobx-react-lite";
import {Text} from "../../helpers/text";
import {TIMEZONE} from "../../constants";

const HfpTooltip = observer(
  ({
    journey = null,
    event = null,
    permanent = false,
    sticky = true,
    direction = "left",
    offset = [-25, 0],
  }) => {
    const prevEvent = useRef(null);
    let usingEvent = event || prevEvent.current;

    if (!usingEvent) {
      return null;
    }

    if (event) {
      prevEvent.current = event;
    }

    return (
      <Tooltip
        sticky={sticky}
        permanent={permanent}
        offset={offset}
        direction={direction}>
        <div data-testid="hfp-tooltip-content">
          <span style={{display: "flex"}}>
            <strong>
              {journey.journeyType !== "journey" ? (
                <>
                  {journey.journeyType}: {journey.uniqueVehicleId}
                </>
              ) : (
                <>
                  {journey.routeId} / {journey.direction}
                </>
              )}
            </strong>
            <span style={{marginLeft: "auto"}}>{journey.departureTime}</span>
          </span>
          <span data-testid="hfp-event-time">
            {moment.tz(usingEvent.recordedAt, TIMEZONE).format("YYYY-MM-DD, HH:mm:ss")}
          </span>
          <br />
          {journey.uniqueVehicleId}
          <br />
          {usingEvent.nextStopId && (
            <>
              <Text>vehicle.next_stop</Text>: {usingEvent.nextStopId}
            </>
          )}
          <br />
          <Text>vehicle.speed</Text>: {Math.round((usingEvent.velocity * 18) / 5)} km/h
          <br />
          {usingEvent.delay > 0 && <>DL: {usingEvent.delay}</>}
        </div>
      </Tooltip>
    );
  }
);

export default HfpTooltip;
