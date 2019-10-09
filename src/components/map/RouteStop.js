import React from "react";
import {Tooltip} from "react-leaflet";
import {latLng} from "leaflet";
import {observer} from "mobx-react";
import {P} from "../Typography";
import {ColoredBackgroundSlot, PlainSlot, PlainSlotSmall, TagButton} from "../TagButton";
import styled from "styled-components";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import get from "lodash/get";
import {
  getNormalTime,
  timeToSeconds,
  secondsToTime,
  secondsToTimeObject,
} from "../../helpers/time";
import {Text} from "../../helpers/text";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import doubleDigit from "../../helpers/doubleDigit";
import {TimeHeading, StopHeading, StopArrivalTime, SmallText} from "../StopElements";
import CalculateTerminalTime from "../sidepanel/journeyDetails/CalculateTerminalTime";
import getDelayType from "../../helpers/getDelayType";
import StopPopupContent, {
  StopContentWrapper,
  StopAlerts,
  StopPopupContentSection,
  StopStreetViewWrapper,
} from "./StopPopupContent";
import MapPopup from "./MapPopup";
import {Button} from "../Forms";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";
import StopMarker from "./StopMarker";
import {inject} from "../../helpers/inject";

const PopupParagraph = styled(P)`
  font-family: var(--font-family);
  font-size: 1rem;
`;

const TooltipParagraph = styled(P)`
  font-family: var(--font-family);
  font-size: 0.875rem;
  margin: 0.5rem 0 -0.5rem;
`;

const DepartureTimeGroup = styled.div`
  min-width: 300px;
`;

@inject("Time")
@observer
class RouteStop extends React.Component {
  onClickTime = (time) => (e) => {
    e.preventDefault();
    this.props.Time.setTime(time);
  };

  onShowStreetView = () => {
    const {onViewLocation, stop} = this.props;
    onViewLocation(latLng({lat: stop.lat, lng: stop.lng}));
  };

  render() {
    const {
      stop,
      stopId,
      departure,
      arrival,
      date,
      firstStop,
      firstTerminal,
      lastTerminal,
      selectedJourney,
      journey,
      showRadius,
    } = this.props;

    const isTerminal = firstTerminal || lastTerminal;

    let stopTooltip = (
      <Tooltip
        key={`stop${stopId}_tooltip`}
        offset={[15, 0]}
        interactive={false}
        direction="right">
        <div>
          <strong>{stop.shortId.replace(/\s*/g, "")}</strong> {stop.stopId}
        </div>
        <div style={{fontSize: "1rem"}}>{stop.name}</div>
      </Tooltip>
    );

    let stopStreetViewPopup = (
      <MapPopup key={`stop_${stopId}_popup`}>
        <StopPopupContent stop={stop} onShowStreetView={this.onShowStreetView} />
      </MapPopup>
    );

    let markerChildren = [stopTooltip, stopStreetViewPopup];

    const mode = getPriorityMode(get(stop, "modes", []));
    let color = getModeColor(mode);

    if (!selectedJourney || (!departure && !arrival)) {
      return (
        <StopMarker
          key={`route_stop_marker_${stop.stopId}`}
          color={color}
          isTerminal={isTerminal}
          stop={stop}
          isTimingStop={get(stop, "isTimingStop", false)}
          showRadius={showRadius}>
          {markerChildren}
        </StopMarker>
      );
    }

    const isPlanned = departure.type === "PLANNED";
    const isTimingStop = get(arrival || departure || stop, "isTimingStop", false);

    const stopDepartureDateTime = get(
      departure,
      "recordedAt",
      get(departure, "plannedDateTime", date)
    );

    const stopAlerts = getAlertsInEffect(stop, stopDepartureDateTime);
    const departureAlerts = getAlertsInEffect(departure);

    const firstDeparture = firstStop;

    const departureDiff = get(departure, "plannedTimeDifference", 0);
    const departureDelayType = !isPlanned ? getDelayType(departureDiff) : "planned";
    const departureDiffTime = secondsToTimeObject(departureDiff);

    const arrivalDiff = get(arrival, "plannedTimeDifference", 0);
    const arrivalDiffTime = secondsToTimeObject(arrivalDiff);

    color = getTimelinessColor(departureDelayType, color);

    const plannedArrivalTime = get(arrival, "plannedTime", "");
    const plannedDepartureTime = get(departure, "plannedTime", "");

    const stopArrivalTime = get(arrival, "recordedTime", "");
    const stopDepartureTime = get(departure, "recordedTime", "");

    // Calculate the duration values

    let plannedDuration = 0;
    let observedDuration = 0;
    let durationDiff = 0;
    let durationDiffSign = "";

    const firstDeparturePlannedDepartureTime = get(firstDeparture, "plannedTime", null);

    if (firstDeparturePlannedDepartureTime) {
      plannedDuration =
        timeToSeconds(departure.plannedTime) - timeToSeconds(firstDeparture.plannedTime);
    }

    const firstDepartureObservedTime = get(firstDeparture, "recordedTime", "");

    const firstDepartureObservedSeconds = timeToSeconds(firstDepartureObservedTime);
    const stopDepartureSeconds = timeToSeconds(stopDepartureTime);

    if (firstDepartureObservedSeconds && stopDepartureSeconds) {
      observedDuration = stopDepartureSeconds - firstDepartureObservedSeconds;
    }

    if (plannedDuration > 0 && observedDuration > 0) {
      const durationDiffSeconds = observedDuration - plannedDuration;
      durationDiffSign = durationDiffSeconds < 0 ? "-" : "";
      durationDiff = secondsToTimeObject(durationDiffSeconds);
    }

    const observedDepartureTime = (
      <TagButton onClick={this.onClickTime(stopDepartureTime)}>
        <PlainSlot>{getNormalTime(plannedDepartureTime)}</PlainSlot>
        {!isPlanned && (
          <>
            <ColoredBackgroundSlot
              color={departureDelayType === "late" ? "var(--dark-grey)" : "white"}
              backgroundColor={color}>
              {departureDiff < 0 ? "-" : ""}
              {departureDiffTime.hours ? doubleDigit(departureDiffTime.hours) + ":" : ""}
              {doubleDigit(get(departureDiffTime, "minutes", 0))}:
              {doubleDigit(get(departureDiffTime, "seconds", 0))}
            </ColoredBackgroundSlot>
            <PlainSlotSmall>{getNormalTime(stopDepartureTime)}</PlainSlotSmall>
          </>
        )}
      </TagButton>
    );

    let observedArrivalTime = null;

    if (arrival && firstTerminal && journey.departure) {
      observedArrivalTime = (
        <CalculateTerminalTime date={date} departure={journey.departure} event={arrival}>
          {({offsetTime, wasLate, diffHours, diffMinutes, diffSeconds, sign}) => (
            <>
              <StopArrivalTime onClick={this.onClickTime(stopArrivalTime)}>
                <PlainSlot
                  style={{
                    fontStyle: "italic",
                    fontSize: "0.925rem",
                    lineHeight: "1.2rem",
                  }}>
                  {offsetTime.format("HH:mm:ss")}*
                </PlainSlot>
                <ColoredBackgroundSlot
                  color="white"
                  backgroundColor={wasLate ? "var(--red)" : "var(--light-green)"}>
                  {sign === "-" ? "-" : ""}
                  {diffHours ? doubleDigit(diffHours) + ":" : ""}
                  {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                </ColoredBackgroundSlot>
                <PlainSlotSmall>{getNormalTime(stopArrivalTime)}</PlainSlotSmall>
              </StopArrivalTime>
              <SmallText>
                * <Text>journey.departure_minus_terminal</Text>
              </SmallText>
            </>
          )}
        </CalculateTerminalTime>
      );
    } else if (arrival && lastTerminal && journey.departure) {
      observedArrivalTime = (
        <CalculateTerminalTime
          recovery={true}
          date={date}
          departure={journey.departure}
          event={arrival}>
          {({offsetTime, wasLate, diffHours, diffMinutes, diffSeconds, sign}) => (
            <StopArrivalTime onClick={this.onClickTime(stopArrivalTime)}>
              <PlainSlot>{offsetTime.format("HH:mm:ss")}</PlainSlot>
              <ColoredBackgroundSlot
                color="white"
                backgroundColor={wasLate ? "var(--red)" : "var(--light-green)"}>
                {sign === "-" ? "-" : ""}
                {diffHours ? doubleDigit(diffHours) + ":" : ""}
                {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
              </ColoredBackgroundSlot>
              <PlainSlotSmall>{getNormalTime(stopArrivalTime)}</PlainSlotSmall>
            </StopArrivalTime>
          )}
        </CalculateTerminalTime>
      );
    } else if (arrival) {
      observedArrivalTime = (
        <StopArrivalTime onClick={this.onClickTime(stopArrivalTime)}>
          <PlainSlot>{getNormalTime(plannedArrivalTime)}</PlainSlot>
          <ColoredBackgroundSlot
            color="var(--dark-grey)"
            backgroundColor="var(--lighter-grey)">
            {arrivalDiff < 0 ? "-" : ""}
            {arrivalDiffTime.hours ? doubleDigit(arrivalDiffTime.hours) + ":" : ""}
            {doubleDigit(get(arrivalDiffTime, "minutes", 0))}:
            {doubleDigit(get(arrivalDiffTime, "seconds", 0))}
          </ColoredBackgroundSlot>
          <PlainSlotSmall>{getNormalTime(stopArrivalTime)}</PlainSlotSmall>
        </StopArrivalTime>
      );
    }

    const doorDidOpen = get(arrival || departure, "doorsOpened", false);
    const stopName = get(stop, "name");
    const stopShortId = get(stop, "shortId", "").replace(/ /g, "");

    const stopPopup = (
      <MapPopup key={`stop${stopId}_popup`}>
        <StopPopupContentSection>
          <StopContentWrapper>
            <StopHeading>
              {stopName && <strong>{stopName}</strong>} {stopId}{" "}
              {stopShortId && `(${stopShortId})`}
            </StopHeading>

            {observedArrivalTime &&
              (isTerminal || isTimingStop) &&
              departure.recordedTime && (
                <>
                  <TimeHeading>
                    <Text>journey.arrival</Text>
                  </TimeHeading>
                  {observedArrivalTime}
                </>
              )}

            {!isPlanned && !doorDidOpen && (
              <PopupParagraph>
                <Text>map.stops.doors_not_open</Text>
              </PopupParagraph>
            )}

            {!lastTerminal && observedDepartureTime && (
              <DepartureTimeGroup>
                <TimeHeading>
                  <Text>journey.departure</Text>
                </TimeHeading>
                {observedDepartureTime}
              </DepartureTimeGroup>
            )}

            {plannedDuration > 0 && observedDuration > 0 && (
              <>
                <TimeHeading>
                  <Text>journey.duration</Text>
                </TimeHeading>
                <TagButton>
                  <PlainSlot>{secondsToTime(plannedDuration)}</PlainSlot>
                  <ColoredBackgroundSlot
                    color="var(--dark-grey)"
                    backgroundColor="var(--lighter-grey)">
                    {durationDiffSign}
                    {durationDiff.hours ? doubleDigit(durationDiff.hours) + ":" : ""}
                    {doubleDigit(get(durationDiff, "minutes", 0))}:
                    {doubleDigit(get(durationDiff, "seconds", 0))}
                  </ColoredBackgroundSlot>
                  <PlainSlotSmall>{secondsToTime(observedDuration)}</PlainSlotSmall>
                </TagButton>
              </>
            )}
          </StopContentWrapper>
        </StopPopupContentSection>
        <StopAlerts alerts={[...stopAlerts, ...departureAlerts]} />
        <StopStreetViewWrapper>
          <Button onClick={this.onShowStreetView}>
            <Text>map.stops.show_in_streetview</Text>
          </Button>
        </StopStreetViewWrapper>
      </MapPopup>
    );

    stopTooltip = (
      <Tooltip key={`stop${stopId}_tooltip`}>
        <div>
          <strong>{stop.shortId.replace(/\s*/g, "")}</strong> {stop.stopId}
        </div>
        <div style={{fontSize: "1rem"}}>{stop.name}</div>
        {!isPlanned && !doorDidOpen && (
          <TooltipParagraph>
            <Text>map.stops.doors_not_open</Text>
          </TooltipParagraph>
        )}
        {(lastTerminal || isTimingStop) && observedArrivalTime && (
          <>
            <TimeHeading>
              <Text>{`journey.event.${arrival.type}`}</Text>
            </TimeHeading>
            {observedArrivalTime}
          </>
        )}

        {!lastTerminal && observedDepartureTime && (
          <>
            <TimeHeading>
              <Text>{`journey.event.${departure.type}`}</Text>
            </TimeHeading>
            {observedDepartureTime}
          </>
        )}
      </Tooltip>
    );

    markerChildren = [stopTooltip, stopPopup];

    return (
      <StopMarker
        key={`journey_stop_marker_${stopId}`}
        dashedBorder={!isPlanned && !doorDidOpen}
        color={color}
        isTimingStop={get(stop, "isTimingStop", false)}
        isTerminal={isTerminal}
        stop={stop}
        alerts={stopAlerts}
        showRadius={showRadius}>
        {markerChildren}
      </StopMarker>
    );
  }
}

export default RouteStop;
