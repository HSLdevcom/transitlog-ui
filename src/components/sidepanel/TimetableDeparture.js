import React, {Component} from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import doubleDigit from "../../helpers/doubleDigit";
import getDelayType from "../../helpers/getDelayType";
import {transportColor} from "../transportModes";
import {
  ColoredBackgroundSlot,
  PlainSlot,
  ColoredSlot,
  TagButton,
  PlainSlotSmall,
} from "../TagButton";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import styled from "styled-components";
import getJourneyId from "../../helpers/getJourneyId";
import {secondsToTimeObject, getNormalTime} from "../../helpers/time";
import {parseLineNumber} from "../../helpers/parseLineNumber";
import {applyTooltip} from "../../hooks/useTooltip";
import {getDayTypeFromDate, dayTypes} from "../../helpers/getDayTypeFromDate";
import AlertIcons from "../AlertIcons";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";
import TimingStop from "../../icons/TimingStop";
import {cancelledStyle} from "../commonComponents";

const ListRow = styled.div`
  padding: 0.25rem 0.5rem 0.25rem 0.75rem;
  margin: 0;
  position: relative;
  background: ${({selected = false}) => (selected ? "var(--blue)" : "transparent")};
  ${cancelledStyle}
`;

const LineSlot = styled(ColoredSlot)`
  white-space: nowrap;
  min-width: 4.75rem;
`;

const PlannedTimeSlot = styled(PlainSlot)`
  min-width: 4.5rem;

  svg {
    margin-left: auto;
  }
`;

const TimetableButton = styled(TagButton)`
  justify-content: flex-start;
`;

const ObservedTimeDisplay = styled(PlainSlotSmall)`
  margin-left: auto;
`;

const SpecialDayDisplay = styled.span`
  padding: 2px;
  border-radius: 2px;
  min-width: 1.1rem;
  text-align: center;
  display: inline-block;
  color: var(--dark-grey);
  background: var(--lighter-blue);
  margin-left: auto;
  font-size: 0.5rem;
`;

@observer
class TimetableDeparture extends Component {
  renderListRow = (
    journeyIsSelected,
    departure,
    color,
    mode,
    isTimingStop,
    isSpecialDayType
  ) => (children = null, onClick) => (
    <ListRow isCancelled={departure.isCancelled} selected={journeyIsSelected}>
      <TimetableButton
        data-testid={`departure-option departure-option-${departure.departureTime}`}
        hasData={!!children}
        selected={journeyIsSelected}
        onClick={onClick}>
        <LineSlot color={color}>
          {parseLineNumber(departure.routeId)}/{departure.direction}
          {isSpecialDayType && (
            <SpecialDayDisplay largeMargin={true} {...applyTooltip("Journey day type")}>
              {departure.dayType}
            </SpecialDayDisplay>
          )}
        </LineSlot>
        <PlannedTimeSlot>
          {getNormalTime(departure.plannedDepartureTime.departureTime).slice(0, -3)}
          {isTimingStop && <TimingStop fill={color} width="1rem" height="1rem" />}
        </PlannedTimeSlot>
        {children}
      </TimetableButton>
      {get(departure, "alerts", []).length !== 0 && (
        <AlertIcons alerts={getAlertsInEffect(departure)} />
      )}
    </ListRow>
  );

  render() {
    const {stop, departure, onClick, selectedJourney} = this.props;

    if (!stop || !departure) {
      return null;
    }

    const {modes = []} = stop;

    const stopMode = modes[0];
    const currentTransportColor = get(transportColor, stopMode, "var(--light-grey)");
    const selectedJourneyId = getJourneyId(selectedJourney, false);
    const isTimingStop = departure.isTimingStop;

    const journeyIsSelected =
      !!selectedJourneyId &&
      selectedJourneyId === getJourneyId(departure.journey || departure, false);

    const isSpecialDayType =
      getDayTypeFromDate(departure.plannedDepartureTime.departureDate) !==
        departure.dayType || !dayTypes.includes(departure.dayType);

    const renderListRow = this.renderListRow(
      journeyIsSelected,
      departure,
      currentTransportColor,
      stopMode,
      isTimingStop,
      isSpecialDayType
    );

    const observedTime = get(departure, "observedDepartureTime", null);
    let observed = null;

    if (observedTime) {
      // Diff planned and observed times
      const observedTimeString = observedTime.departureTime;
      const diff = observedTime.departureTimeDifference;
      const delayType = getDelayType(diff);
      const {hours, minutes, seconds} = secondsToTimeObject(diff);

      observed = (
        <>
          <ColoredBackgroundSlot
            color={delayType === "late" ? "var(--dark-grey)" : "white"}
            backgroundColor={getTimelinessColor(delayType, "var(--light-green)")}>
            {diff < 0 === "-" ? "-" : ""}
            {hours ? doubleDigit(hours) + ":" : ""}
            {doubleDigit(minutes)}:{doubleDigit(seconds)}
          </ColoredBackgroundSlot>
          <ObservedTimeDisplay>{observedTimeString}</ObservedTimeDisplay>
        </>
      );
    }
    return renderListRow(observed, onClick(departure));
  }
}

export default TimetableDeparture;
