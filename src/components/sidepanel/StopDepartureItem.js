import React, {useMemo} from "react";
import {observer} from "mobx-react-lite";
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

const InstanceDisplay = styled.span`
  margin-left: 0.25rem;
  padding: 2px;
  border-radius: 2px;
  background: var(--lighter-grey);
  min-width: 1rem;
  font-size: 0.6rem;
  text-align: center;
  display: inline-block;
  color: var(--dark-grey);
`;

const StopDepartureItem = observer((props) => {
  const {stop, departure, onClick, selectedJourney} = props;

  const onClickDeparture = useMemo(() => onClick(departure), [departure, onClick]);

  if (!stop || !departure) {
    return null;
  }

  const {modes = []} = stop;

  const stopMode = modes[0];
  const currentTransportColor = get(transportColor, stopMode, "var(--light-grey)");
  const selectedJourneyId = getJourneyId(selectedJourney);
  const isTimingStop = departure.isTimingStop;
  const instance = get(departure, "journey._numInstance", 0);

  const journeyIsSelected =
    !!selectedJourneyId &&
    selectedJourneyId === getJourneyId(departure.journey || departure);

  const isSpecialDayType =
    getDayTypeFromDate(departure.plannedDepartureTime.departureDate) !==
      departure.dayType || !dayTypes.includes(departure.dayType);

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

  return (
    <ListRow isCancelled={departure.isCancelled} selected={journeyIsSelected}>
      <TimetableButton
        data-testid={`departure-option departure-option-${departure.departureTime}`}
        hasData={!!observed}
        selected={journeyIsSelected}
        onClick={onClickDeparture}>
        <LineSlot color={currentTransportColor}>
          {parseLineNumber(departure.routeId)}/{departure.direction}
          {isSpecialDayType && (
            <SpecialDayDisplay largeMargin={true} {...applyTooltip("Journey day type")}>
              {departure.dayType}
            </SpecialDayDisplay>
          )}
          {instance > 0 && (
            <InstanceDisplay {...applyTooltip("Journey instance")}>
              {instance}
            </InstanceDisplay>
          )}
        </LineSlot>
        <PlannedTimeSlot>
          {getNormalTime(departure.plannedDepartureTime.departureTime).slice(0, -3)}
          {isTimingStop && (
            <TimingStop fill={currentTransportColor} width="1rem" height="1rem" />
          )}
        </PlannedTimeSlot>
        {observed}
      </TimetableButton>
    </ListRow>
  );
});

export default StopDepartureItem;
