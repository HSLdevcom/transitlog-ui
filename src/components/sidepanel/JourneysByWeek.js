import React, {useCallback, useState, useEffect, useMemo} from "react";
import {observer, Observer} from "mobx-react-lite";
import getJourneyId, {createDepartureJourneyId} from "../../helpers/getJourneyId";
import styled from "styled-components";
import SidepanelList from "./SidepanelList";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import {secondsToTimeObject} from "../../helpers/time";
import flow from "lodash/flow";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import get from "lodash/get";
import map from "lodash/map";
import {inject} from "../../helpers/inject";
import doubleDigit from "../../helpers/doubleDigit";
import {getDayTypeFromDate} from "../../helpers/getDayTypeFromDate";
import getWeek from "date-fns/get_iso_week";
import format from "date-fns/format";
import JourneysByWeekQuery from "../../queries/JourneysByWeekQuery";
import ButtonGroup from "../ButtonGroup";
import {TIMEZONE} from "../../constants";
import moment from "moment-timezone";
import Tooltip from "../Tooltip";
import getDelayType from "../../helpers/getDelayType";
import {text, Text} from "../../helpers/text";
import {TransportIcon} from "../transportModes";
import SomethingWrong from "../../icons/SomethingWrong";
import Cross from "../../icons/Cross";
import AlertIcons from "../AlertIcons";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";
import {cancelledStyle} from "../commonComponents";
import CrossThick from "../../icons/CrossThick";
import Timetable from "../../icons/Timetable";
import {weeklyObservedTimeTypes} from "../../stores/UIStore";
import ToggleButton from "../ToggleButton";

const ListHeader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ListHeading = styled.div`
  display: flex;
  text-transform: capitalize;
  padding: 0.25rem 0 0.75rem;
  justify-content: space-between;

  h4 {
    margin: 0;
  }
`;

const ListWrapper = styled.div``;

const RouteHeading = styled.div`
  display: flex;

  svg {
    margin-right: 0.5rem;
  }
`;

const TableRow = styled.div`
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--lightest-grey);
  flex-wrap: nowrap;
  background-color: ${({isSelected = false}) => (isSelected ? "#f6fcff" : "white")};
`;

const TableBody = styled.div`
  padding-top: 2rem;
`;

const TableCell = styled.div`
  width: 4.125rem;
  padding: 0.5rem 0.25rem;
  flex: 1 1 auto;
  text-align: center;
  border: 0;
  border-right: 1px solid var(--lightest-grey);
  font-size: 0.75rem;
  font-weight: ${({strong = false}) => (strong ? "bold" : "normal")};
  background: ${({backgroundColor = "transparent", highlight = false}) =>
    (!backgroundColor || backgroundColor === "transparent") && highlight
      ? "#f6fcff"
      : backgroundColor};
  color: ${({color}) => color};
  position: relative;

  &:last-child {
    border-right: 0;
  }
`;

const TableCellButton = styled(TableCell.withComponent("button"))`
  cursor: pointer;
  font-weight: bold;
  display: block;
  font-family: inherit;
  outline: 0;
  ${cancelledStyle}
`;

const TableCellIcons = styled(AlertIcons)`
  bottom: 2px;
  left: 2px;
  padding: 0 2px;
  border-radius: 2px;
  background: white;
  height: 0.75rem;
  display: flex;
  align-items: center;

  svg {
    width: 0.5rem !important;
    height: 0.5rem !important;
  }

  &:empty {
    padding: 0;
  }
`;

const TableHeader = styled(TableRow)`
  font-weight: bold;
  border-bottom-width: 1px;
  border-color: var(--alt-grey);

  ${TableCell} {
    border-color: var(--alt-grey);
  }
`;

const TimeTypeButton = styled(ToggleButton)`
  padding: 0;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.25rem;
  width: auto;
`;

const decorate = flow(
  observer,
  inject("UI", "Journey", "Filters", "Time")
);

const JourneysByWeek = decorate(
  ({state, Time, UI, Filters, Journey, route: propsRoute}) => {
    const {weeklyObservedTimes} = state;

    const selectJourney = useCallback((journeyOrDeparture, matchVehicle = true) => {
      let journeyToSelect = null;
      let journeyId = "";
      let departureTime = "";
      let departureDate = "";

      if (journeyOrDeparture) {
        if (journeyOrDeparture.originDepartureTime) {
          journeyId = createDepartureJourneyId(journeyOrDeparture);

          departureTime = get(
            journeyOrDeparture,
            "originDepartureTime.departureTime",
            ""
          );

          departureDate = get(
            journeyOrDeparture,
            "originDepartureTime.departureDate",
            ""
          );
        } else {
          journeyId = getJourneyId(journeyOrDeparture, matchVehicle);
          departureTime = journeyOrDeparture.departureTime;
          departureDate = journeyOrDeparture.departureDate;
        }

        const selectedJourneyId = getJourneyId(state.selectedJourney, matchVehicle);

        // Only set these if the journey is truthy and was not already selected
        if (journeyId && selectedJourneyId !== journeyId) {
          Time.setTime(departureTime);
          Filters.setDate(departureDate);
          journeyToSelect = {
            departureDate,
            departureTime,
            direction: journeyOrDeparture.direction,
            routeId: journeyOrDeparture.routeId,
            uniqueVehicleId: journeyOrDeparture.uniqueVehicleId || "",
          };
        }
      }

      Journey.setSelectedJourney(journeyToSelect);
    }, []);

    const onChangeObservedTimeType = useCallback((e) => {
      const value = e.target.value;

      UI.setWeeklyObservedTimesType(
        value === weeklyObservedTimeTypes.FIRST_STOP_DEPARTURE
          ? weeklyObservedTimeTypes.LAST_STOP_ARRIVAL
          : weeklyObservedTimeTypes.FIRST_STOP_DEPARTURE
      );
    }, []);

    const {date, route: stateRoute, selectedJourney} = state;
    const route = propsRoute || stateRoute;
    const {originStopId = "", destinationStopId = ""} = route;

    const selectedJourneyId = getJourneyId(selectedJourney);

    const weekNumber = getWeek(date);
    const currentDayType = getDayTypeFromDate(date);

    const [selectedDayTypes, setSelectedDayTypes] = useState([]);
    const currentDayTypeIndex = selectedDayTypes.indexOf(currentDayType);

    const setWeekdays = useCallback(() => {
      setSelectedDayTypes(["Ma", "Ti", "Ke", "To", "Pe"]);
    }, []);

    const setSaturday = useCallback(() => {
      setSelectedDayTypes(["La"]);
    }, []);

    const setSunday = useCallback(() => {
      setSelectedDayTypes(["Su"]);
    }, []);

    useEffect(() => {
      if (currentDayType === "La") {
        setSaturday();
      } else if (currentDayType === "Su") {
        setSunday();
      } else {
        setWeekdays();
      }
    }, [currentDayType]);

    const weekStartDate = useMemo(
      () =>
        moment
          .tz(date, TIMEZONE)
          .startOf("isoWeek")
          .format("YYYY-MM-DD"),
      [date]
    );

    const selectedDates = useMemo(() => {
      const weekStart = moment.tz(weekStartDate, TIMEZONE);
      const weekEnd = weekStart.clone().endOf("isoWeek");

      if (selectedDayTypes.includes("Su")) {
        return [weekEnd.format("YYYY-MM-DD")];
      }

      if (selectedDayTypes.includes("La")) {
        return [weekEnd.subtract(1, "day").format("YYYY-MM-DD")];
      }

      const dates = [];

      while (dates.length < 5) {
        dates.push(weekStart.format("YYYY-MM-DD"));
        weekStart.add(1, "day");
      }

      return dates;
    }, [weekStartDate, selectedDayTypes]);

    const showLastStopArrival =
      weeklyObservedTimes === weeklyObservedTimeTypes.LAST_STOP_ARRIVAL;

    return (
      <JourneysByWeekQuery
        skip={!get(route, "routeId", null)}
        route={route}
        lastStopArrival={showLastStopArrival}
        date={weekStartDate}>
        {({departures, loading}) => (
          <Observer>
            {() => {
              const departuresByTime = groupBy(
                departures.filter(({plannedDepartureTime}) =>
                  selectedDates.includes(plannedDepartureTime.departureDate)
                ),
                showLastStopArrival
                  ? "plannedArrivalTime.arrivalTime"
                  : "plannedDepartureTime.departureTime"
              );

              const mode = get(departures, "[0].mode", "BUS");

              return (
                <SidepanelList
                  focusKey={selectedJourneyId}
                  loading={loading}
                  header={
                    <ListHeader>
                      <TimeTypeButton
                        type="checkbox"
                        onChange={onChangeObservedTimeType}
                        name="observed_times_type"
                        isSwitch={true}
                        preLabel={`${originStopId} ${text(
                          "sidepanel.tabs.week_journeys.first_stop_depart"
                        )}`}
                        label={`${destinationStopId} ${text(
                          "sidepanel.tabs.week_journeys.last_stop_arrive"
                        )}`}
                        checked={
                          weeklyObservedTimes !==
                          weeklyObservedTimeTypes.FIRST_STOP_DEPARTURE
                        }
                        value={weeklyObservedTimes}
                      />
                      <ListHeading>
                        <RouteHeading>
                          <TransportIcon width={23} height={23} mode={mode} />
                          <h4>
                            {route.routeId} / {route.direction}{" "}
                          </h4>
                        </RouteHeading>
                        <div>
                          <Text>general.week</Text> {weekNumber}
                        </div>
                      </ListHeading>
                      <div>
                        <ButtonGroup
                          buttons={[
                            {
                              key: "MaPe",
                              label: text("general.weekdays"),
                              onClick: setWeekdays,
                              active: selectedDayTypes.includes("Ma"),
                              helpText: "Select weekdays",
                            },
                            {
                              key: "La",
                              label: text("general.saturday"),
                              onClick: setSaturday,
                              active: selectedDayTypes.includes("La"),
                              helpText: "Select saturday",
                            },
                            {
                              key: "Su",
                              label: text("general.sunday"),
                              onClick: setSunday,
                              active: selectedDayTypes.includes("Su"),
                              helpText: "Select sunday",
                            },
                          ]}
                        />
                      </div>
                    </ListHeader>
                  }
                  floatingListHeader={
                    <TableHeader>
                      <TableCell>
                        <Text>general.time</Text>
                      </TableCell>
                      {selectedDates.map((day, idx) => (
                        <TableCell
                          highlight={idx === currentDayTypeIndex}
                          key={`header_date_${day}`}>
                          {format(day, "D.M")}
                        </TableCell>
                      ))}
                    </TableHeader>
                  }>
                  {(scrollRef) => (
                    <ListWrapper>
                      <TableBody>
                        {map(departuresByTime, (departuresAtTime, plannedTime) => {
                          const departureDatePath = showLastStopArrival
                            ? "originDepartureTime.departureDate"
                            : "plannedDepartureTime.departureDate";

                          const selectedDayDepartures = orderBy(
                            departuresAtTime,
                            departureDatePath
                          );

                          if (selectedDayDepartures.length === 0) {
                            return null;
                          }

                          const weekDepartures = [];

                          let rowIsSelected = false;
                          let colIndex = 0;

                          while (weekDepartures.length < selectedDates.length) {
                            // The day type that we want to find a departure for
                            const date = selectedDates[colIndex];

                            const dep =
                              selectedDayDepartures.find(
                                (dep) => get(dep, departureDatePath, "") === date
                              ) || null;

                            // Check if the row contains a selected departure
                            if (dep) {
                              const journeyId = createDepartureJourneyId(
                                dep,
                                showLastStopArrival ? false : plannedTime
                              );

                              if (
                                selectedJourney &&
                                getJourneyId(selectedJourney, false) === journeyId
                              ) {
                                rowIsSelected = true;
                              }
                            }

                            weekDepartures.push(dep);
                            colIndex++;
                          }

                          return (
                            <TableRow
                              key={`departure_row_${plannedTime}`}
                              isSelected={rowIsSelected}
                              ref={rowIsSelected ? scrollRef : null}>
                              <TableCell strong={true}>
                                {plannedTime.slice(0, -3)}
                              </TableCell>
                              {weekDepartures.map((departure, idx) => {
                                const dayType = get(departure, "dayType", "unknown");

                                const observedTimePath = showLastStopArrival
                                  ? "observedArrivalTime"
                                  : "observedDepartureTime";

                                const observedTime = get(
                                  departure,
                                  observedTimePath,
                                  null
                                );

                                // The departure is unavailable for some reason
                                let departureStatus = "notavailable";

                                // Find out the status of the departure
                                if (departure && departure.isCancelled) {
                                  departureStatus = observedTime
                                    ? "partially-cancelled"
                                    : "cancelled";
                                } else if (departure && observedTime) {
                                  // We have a planned departure and observed times
                                  departureStatus = "ok";
                                } else if (departure && !observedTime) {
                                  // We have a departure but no observed time, yet.
                                  departureStatus = "notobserved";
                                } else if (
                                  !departure &&
                                  weekDepartures.some((dep) => !!dep)
                                ) {
                                  // We don't have a departure, but there are other departures this week for this time.
                                  departureStatus = "notforday";
                                }

                                // Show an icon if the departure is not ok
                                if (
                                  !["partially-cancelled", "ok"].includes(departureStatus)
                                ) {
                                  let IconComponent = null;

                                  switch (departureStatus) {
                                    case "cancelled":
                                      IconComponent = CrossThick;
                                      break;
                                    case "notforday":
                                      IconComponent = Cross;
                                      break;
                                    case "notobserved":
                                      IconComponent = Timetable;
                                      break;
                                    case "notavailable":
                                    default:
                                      IconComponent = SomethingWrong;
                                      break;
                                  }

                                  const departureIsSelected =
                                    departure &&
                                    ((showLastStopArrival &&
                                      departure.originDepartureTime) ||
                                      !showLastStopArrival) &&
                                    getJourneyId(selectedJourney, false) ===
                                      createDepartureJourneyId(departure);

                                  return (
                                    <Tooltip
                                      helpText={`This departure is not available due to: ${departureStatus}, ${dayType}`}
                                      key={`departure_day_${dayType}_${departureStatus}_${plannedTime}_${idx}`}>
                                      <TableCellButton
                                        color={
                                          departureIsSelected
                                            ? "white"
                                            : "var(--dark-grey)"
                                        }
                                        backgroundColor={
                                          departureIsSelected
                                            ? "var(--light-blue)"
                                            : "transparent"
                                        }
                                        onClick={() => selectJourney(departure, false)}
                                        highlight={idx === currentDayTypeIndex}>
                                        <IconComponent
                                          width="1rem"
                                          height="1rem"
                                          fill={
                                            departureStatus === "cancelled"
                                              ? "var(--red)"
                                              : departureIsSelected
                                              ? "white"
                                              : "var(--light-grey)"
                                          }
                                        />
                                        <TableCellIcons
                                          alerts={getAlertsInEffect(departure)}
                                        />
                                      </TableCellButton>
                                    </Tooltip>
                                  );
                                }

                                const journeyId = getJourneyId(departure.journey);
                                const journeyIsSelected =
                                  selectedJourneyId && selectedJourneyId === journeyId;

                                const plannedObservedDiff = showLastStopArrival
                                  ? departure.observedArrivalTime.arrivalTimeDifference
                                  : departure.observedDepartureTime
                                      .departureTimeDifference;

                                const diffTime = secondsToTimeObject(plannedObservedDiff);
                                const delayType = getDelayType(plannedObservedDiff);

                                const color = getTimelinessColor(
                                  delayType,
                                  "var(--light-green)",
                                  true
                                );

                                const bgColor = getTimelinessColor(
                                  delayType,
                                  "var(--light-green)"
                                );

                                return (
                                  <Tooltip
                                    helpText="Journey list diff"
                                    key={`departure_day_${departure.dayType}_${plannedTime}`}>
                                    <TableCellButton
                                      isCancelled={departure.isCancelled}
                                      highlight={idx === currentDayTypeIndex}
                                      onClick={() =>
                                        selectJourney(departure.journey, true)
                                      }
                                      color={
                                        journeyIsSelected
                                          ? delayType === "late"
                                            ? "var(--dark-grey)"
                                            : "white"
                                          : color
                                      }
                                      backgroundColor={
                                        journeyIsSelected ? bgColor : "transparent"
                                      }>
                                      {plannedObservedDiff < 0 ? "-" : ""}
                                      {doubleDigit(diffTime.minutes)}:
                                      {doubleDigit(diffTime.seconds)}
                                      <TableCellIcons
                                        alerts={getAlertsInEffect(departure)}
                                      />
                                    </TableCellButton>
                                  </Tooltip>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </ListWrapper>
                  )}
                </SidepanelList>
              );
            }}
          </Observer>
        )}
      </JourneysByWeekQuery>
    );
  }
);

export default JourneysByWeek;
