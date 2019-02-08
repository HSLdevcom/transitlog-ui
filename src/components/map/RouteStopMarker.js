import React from "react";
import {Marker, CircleMarker, Tooltip, Popup} from "react-leaflet";
import {icon, latLng} from "leaflet";
import TimingStopIcon from "../../icon-time1.svg";
import {observer} from "mobx-react";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";
import getDelayType from "../../helpers/getDelayType";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";
import {Heading, P} from "../Typography";
import {ColoredBackgroundSlot} from "../TagButton";
import styled from "styled-components";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import moment from "moment-timezone";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import get from "lodash/get";
import {StopRadius} from "./StopRadius";
import DeparturesQuery from "../../queries/DeparturesQuery";
import {departureTime} from "../../helpers/time";
import {Text} from "../../helpers/text";
import {TIMEZONE} from "../../constants";

const PopupParagraph = styled(P)`
  font-size: 1rem;
`;

const PlannedTime = styled.span`
  font-size: 1rem;
  font-weight: bold;
`;

const ObservedTime = styled(ColoredBackgroundSlot)`
  font-size: 0.875rem;
`;

@observer
class RouteStopMarker extends React.Component {
  createStopMarker = (delayType, color, isTerminal, children) => {
    const {stop, showRadius, selected, onSelect} = this.props;

    const timingStopIcon = icon({
      iconUrl: TimingStopIcon,
      iconSize: [30, 30],
      iconAnchor: [23, 25 / 2],
      popupAnchor: [3, -15],
      className: `stop-marker timing-stop ${delayType}`,
    });

    const mode = getPriorityMode(get(stop, "modes.nodes", []));
    const stopColor = getModeColor(mode);

    const markerPosition = [stop.lat, stop.lon];

    const markerElement = React.createElement(
      stop.timingStopType ? Marker : CircleMarker,
      {
        pane: "stops",
        icon: stop.timingStopType ? timingStopIcon : null,
        center: markerPosition, // One marker type uses center...
        position: markerPosition, // ...the other uses position.
        color: color,
        fillColor: selected ? stopColor : "white",
        fillOpacity: 1,
        strokeWeight: isTerminal ? 5 : 3,
        radius: isTerminal || selected ? 12 : 8,
        onClick: onSelect,
      },
      children
    );

    return showRadius ? (
      <StopRadius
        key={`stop_radius_${stop.stopId}${selected ? "_selected" : ""}`}
        isHighlighted={selected}
        center={markerPosition}
        radius={stop.stopRadius}
        color={stopColor}>
        {markerElement}
      </StopRadius>
    ) : (
      markerElement
    );
  };

  onShowStreetView = (e) => {
    const {onViewLocation, stop} = this.props;
    onViewLocation(latLng({lat: stop.lat, lng: stop.lon}));
  };

  render() {
    const {
      stop,
      firstTerminal,
      lastTerminal,
      positions = [],
      date,
      selectedJourney,
    } = this.props;

    const isTerminal = firstTerminal || lastTerminal;

    let stopTooltip = (
      <Tooltip key={`stop${stop.stopId}_tooltip`}>
        {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
      </Tooltip>
    );

    let stopStreetViewPopup = (
      <Popup
        minWidth={300}
        maxWidth={800}
        autoPan={true}
        key={`stop_${stop.stopId}_popup`}>
        <Heading level={4}>
          {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Heading>
        <button onClick={this.onShowStreetView}>Show in street view</button>
      </Popup>
    );

    let markerChildren = [stopTooltip, stopStreetViewPopup];

    const mode = getPriorityMode(get(stop, "modes.nodes", []));
    const stopColor = getModeColor(mode);

    let color = stopColor;
    let delayType = "none";

    if (positions.length === 0 || !selectedJourney) {
      return this.createStopMarker(delayType, color, isTerminal, markerChildren);
    }

    const {
      route_id = "",
      direction_id = "",
      journey_start_time = "",
    } = selectedJourney;

    return (
      <DeparturesQuery
        stop={stop}
        date={date}
        route={{routeId: route_id, direction: direction_id}}>
        {({departures = [], loading: departuresLoading}) => {
          // Show a marker without the popup if we don't have any data
          if (departuresLoading || departures.length === 0 || !journey_start_time) {
            return this.createStopMarker(
              delayType,
              color,
              isTerminal,
              markerChildren
            );
          }

          const groupedDepartures = groupBy(departures, ({originDeparture}) =>
            departureTime(originDeparture)
          );

          let departure = get(groupedDepartures, `${journey_start_time}[0]`, null);

          // If we don't have a departure, no biggie, just render the stop marker at this point.
          if (!departure) {
            return this.createStopMarker(
              delayType,
              color,
              isTerminal,
              markerChildren
            );
          }

          const stopPositions = orderBy(
            positions.filter(
              (pos) =>
                pos.journey_start_time === journey_start_time &&
                pos.next_stop_id === stop.stopId
            ),
            "received_at_unix",
            "desc"
          );

          // Find the hfp item that matches this departure.
          // Sort by received_at descending and select the first element, this way we get the
          // hfp item that represents the time when the vehicle left the stop, ie the
          // last hfp item before the next_stop_id value changed.
          let departureHfpItem = stopPositions[0];

          // Again, render the marker at this point if we didn't find an hfp item.
          if (!departureHfpItem) {
            return this.createStopMarker(
              delayType,
              color,
              isTerminal,
              markerChildren
            );
          }

          // Find out when the vehicle arrived at the stop
          // by looking at when the doors were opened.
          let doorDidOpen = false;
          let arrivalHfpItem = departureHfpItem;

          for (const positionIndex in stopPositions) {
            const position = stopPositions[positionIndex];

            if (doorDidOpen && !position.drst) {
              arrivalHfpItem = stopPositions[positionIndex - 1];
              break;
            }

            if (!doorDidOpen && !!position.drst) {
              doorDidOpen = true;
            }
          }

          // Get the difference between the planned and the observed time,
          // now that we have both.
          const {observedMoment, plannedMoment, diff} = diffDepartureJourney(
            departureHfpItem,
            departure,
            date
          );

          delayType = getDelayType(diff);
          color = getTimelinessColor(delayType, stopColor);

          if (observedMoment) {
            const observedTime = (
              <ObservedTime
                backgroundColor={color}
                color={delayType === "late" ? "var(--dark-grey)" : "white"}>
                {observedMoment.format("HH:mm:ss")}
              </ObservedTime>
            );

            let arrivalMoment;

            if (doorDidOpen) {
              arrivalMoment = moment.tz(arrivalHfpItem.received_at, TIMEZONE);
            }

            const stopPopup = (
              <Popup
                maxHeight={750}
                maxWidth={550}
                autoPan={true}
                key={`stop${stop.stopId}_popup`}>
                <Heading level={4}>
                  {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
                </Heading>
                {doorDidOpen ? (
                  <PopupParagraph>
                    <Text>map.stops.arrive</Text>:{" "}
                    <PlannedTime>{arrivalMoment.format("HH:mm:ss")}</PlannedTime>
                  </PopupParagraph>
                ) : (
                  <PopupParagraph>
                    <Text>map.stops.doors_not_open</Text>
                  </PopupParagraph>
                )}
                <PopupParagraph>
                  <Text>map.stops.planned_driveby</Text>:{" "}
                  <PlannedTime>{plannedMoment.format("HH:mm:ss")}</PlannedTime>
                </PopupParagraph>
                <PopupParagraph>
                  <Text>map.stops.observed_driveby</Text>: {observedTime}
                </PopupParagraph>
                <button onClick={this.onShowStreetView}>
                  <Text>map.stops.show_in_streetview</Text>
                </button>
              </Popup>
            );

            stopTooltip = (
              <Tooltip key={`stop${stop.stopId}_tooltip`}>
                {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})<br />
                {observedTime}
              </Tooltip>
            );

            markerChildren = [stopTooltip, stopPopup];
          }

          return this.createStopMarker(delayType, color, isTerminal, markerChildren);
        }}
      </DeparturesQuery>
    );
  }
}

export default RouteStopMarker;
