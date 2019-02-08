import React, {Component} from "react";
import {observer, inject, Observer} from "mobx-react";
import get from "lodash/get";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";
import styled from "styled-components";
import {Text, text} from "../../helpers/text";
import doubleDigit from "../../helpers/doubleDigit";
import Loading from "../Loading";
import SidepanelList from "./SidepanelList";
import {createRouteId} from "../../helpers/keys";
import {ColoredBackgroundSlot} from "../TagButton";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";
import getDelayType from "../../helpers/getDelayType";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import {expr} from "mobx-utils";
import RouteJourneys, {journeyHfpStates} from "../RouteJourneys";
import {getNormalTime} from "../../helpers/time";

const JourneyListRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({selected = false}) =>
    selected ? "var(--blue)" : "rgba(0, 0, 0, 0.025)"};
  padding: 0.75rem 1rem;
  border: 0;
  max-width: none;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  color: ${({selected = false}) => (selected ? "white" : "var(--grey)")};
  outline: none;

  &:nth-child(odd) {
    background: ${({selected = false}) =>
      selected ? "var(--blue)" : "rgba(255, 255, 255, 0.025)"};
  }
`;

const JourneyRowLeft = styled.span`
  display: block;
  font-weight: bold;
  min-width: 6rem;
  text-align: left;
`;

const DelaySlot = styled(ColoredBackgroundSlot)`
  font-size: 0.875rem;
  margin: -2.5px 0;
  transform: none;
  padding: 5px;
  line-height: 1;
`;

const TimeSlot = styled.span`
  font-size: 0.857rem;
  font-family: "Courier New", Courier, monospace;
  min-width: 5rem;
  text-align: right;
`;

@inject(app("Journey", "Time", "Filters"))
@observer
class Journeys extends Component {
  selectJourney = (journeyOrTime) => (e) => {
    e.preventDefault();
    const {Time, Journey, state} = this.props;
    let journeyToSelect = null;

    if (journeyOrTime) {
      const journey =
        typeof journeyOrTime === "string"
          ? Journey.createCompositeJourney(state.date, state.route, journeyOrTime)
          : journeyOrTime;

      const journeyId = getJourneyId(journey);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && getJourneyId(state.selectedJourney) !== journeyId) {
        Time.setTime(journey.journey_start_time);
        journeyToSelect = journey;
      }
    }
    Journey.setSelectedJourney(journeyToSelect);
  };

  render() {
    const {state} = this.props;
    const {date, route} = state;

    const selectedJourneyId = expr(() => getJourneyId(state.selectedJourney));

    return (
      <RouteJourneys>
        {({journeys, loading}) => (
          <Observer>
            {() => {
              let focusedJourney = expr(() => {
                // Make sure that the selected journey belongs to the currently selected route.
                if (
                  selectedJourneyId &&
                  state.selectedJourney &&
                  createRouteId(state.selectedJourney) === createRouteId(route)
                ) {
                  return selectedJourneyId;
                }

                const time = parseInt(state.time.replace(":", "").slice(0, 4));
                let closestDeparture = null;
                let prevDiff = -1;

                for (const departure of journeys) {
                  const departureTime = get(departure, "time", "");

                  if (!departureTime) {
                    continue;
                  }

                  const departureTimeNum = parseInt(
                    departureTime.replace(":", "").slice(0, 4)
                  );
                  const diff = Math.abs(departureTimeNum - time);

                  if (prevDiff === -1 || diff < prevDiff) {
                    prevDiff = diff;
                    closestDeparture = departure;
                  }
                }

                return closestDeparture
                  ? get(closestDeparture, "journeyId", null)
                  : null;
              });

              return (
                <SidepanelList
                  reset={!focusedJourney || journeys.length === 0}
                  loading={loading}
                  header={
                    <>
                      <JourneyRowLeft>
                        <Text>filterpanel.planned_start_time</Text>
                      </JourneyRowLeft>
                      <span>
                        <Text>filterpanel.real_start_time</Text>
                      </span>
                    </>
                  }>
                  {(scrollRef) =>
                    journeys.map((journey) => {
                      if (!journey.events || typeof journey.events === "string") {
                        const journeyId = journey.journeyId;

                        const journeyIsSelected = expr(
                          () =>
                            state.selectedJourney && selectedJourneyId === journeyId
                        );

                        const journeyIsFocused =
                          focusedJourney && focusedJourney === journeyId;

                        let fetchStatus = journey.events;

                        return (
                          <JourneyListRow
                            ref={journeyIsFocused ? scrollRef : null}
                            key={`planned_journey_row_${journeyId}`}
                            selected={journeyIsSelected}
                            onClick={this.selectJourney(journey.time)}>
                            <JourneyRowLeft>
                              {getNormalTime(journey.time)}
                            </JourneyRowLeft>
                            {fetchStatus === journeyHfpStates.NOT_FOUND ? (
                              <span>{text("filterpanel.journey.no_data")}</span>
                            ) : fetchStatus === journeyHfpStates.LOADING ? (
                              <Loading inline />
                            ) : (
                              <span>
                                {text("filterpanel.journey.click_to_fetch")}
                              </span>
                            )}
                          </JourneyListRow>
                        );
                      }

                      const journeyId = journey.journeyId;
                      const journeyEvent = get(journey, "events[0]", null);

                      let observedJourney = (
                        <Text>filterpanel.journey.incomplete_data</Text>
                      );

                      const journeyIsSelected = expr(
                        () =>
                          state.selectedJourney && selectedJourneyId === journeyId
                      );

                      if (journeyEvent) {
                        const plannedObservedDiff = diffDepartureJourney(
                          journeyEvent,
                          journey.departure,
                          date
                        );

                        const observedTimeString = plannedObservedDiff
                          ? plannedObservedDiff.observedMoment.format("HH:mm:ss")
                          : "";

                        const delayType = plannedObservedDiff
                          ? getDelayType(plannedObservedDiff.diff)
                          : "none";

                        observedJourney = (
                          <>
                            <DelaySlot
                              color={
                                delayType === "late" ? "var(--dark-grey)" : "white"
                              }
                              backgroundColor={getTimelinessColor(
                                delayType,
                                "var(--light-green)"
                              )}>
                              {plannedObservedDiff.sign === "-" ? "-" : ""}
                              {plannedObservedDiff.hours
                                ? doubleDigit(plannedObservedDiff.hours) + ":"
                                : ""}
                              {doubleDigit(plannedObservedDiff.minutes)}:
                              {doubleDigit(plannedObservedDiff.seconds)}
                            </DelaySlot>
                            <TimeSlot>{observedTimeString}</TimeSlot>
                          </>
                        );
                      }

                      const journeyIsFocused =
                        focusedJourney && focusedJourney === journeyId;

                      return (
                        <JourneyListRow
                          ref={journeyIsFocused ? scrollRef : null}
                          selected={journeyIsSelected}
                          key={`journey_row_${journeyId}`}
                          onClick={this.selectJourney(journeyEvent)}>
                          <JourneyRowLeft>
                            {getNormalTime(journeyEvent.journey_start_time)}
                          </JourneyRowLeft>
                          {observedJourney}
                        </JourneyListRow>
                      );
                    })
                  }
                </SidepanelList>
              );
            }}
          </Observer>
        )}
      </RouteJourneys>
    );
  }
}

export default Journeys;
