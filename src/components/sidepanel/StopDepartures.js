import React, {useEffect, useCallback} from "react";
import {observer, Observer} from "mobx-react-lite";
import styled from "styled-components";
import Input from "../Input";
import {text} from "../../helpers/text";
import get from "lodash/get";
import flow from "lodash/flow";
import {Button} from "../Forms";
import {setResetListener} from "../../stores/FilterStore";
import VirtualizedSidepanelList from "./VirtualizedSidepanelList";
import StopDepartureItem from "./StopDepartureItem";
import {getDepartureByTime} from "../../helpers/getDepartureByTime";
import getJourneyId from "../../helpers/getJourneyId";
import {createCompositeJourney} from "../../stores/journeyActions";
import {inject} from "../../helpers/inject";
import {intval} from "../../helpers/isWithinRange";
import gql from "graphql-tag";
import {CancellationFieldsFragment} from "../../queries/CancellationFieldsFragment";
import {useQueryData} from "../../hooks/useQueryData";

export const departuresQuery = gql`
  query departures(
    $stopId: String
    $terminalId: String
    $date: Date!
    $routeId: String
    $minHour: Int
    $maxHour: Int
  ) {
    departures(
      stopId: $stopId
      terminalId: $terminalId
      date: $date
      filter: {routeId: $routeId, maxHour: $maxHour, minHour: $minHour}
    ) {
      id
      stopId
      routeId
      direction
      dayType
      departureId
      departureDate
      departureTime
      equipmentColor
      equipmentType
      extraDeparture
      index
      isNextDay
      isTimingStop
      operatorId
      terminalTime
      recoveryTime
      isCancelled
      cancellations {
        ...CancellationFieldsFragment
      }
      journey {
        id
        journeyType
        type
        routeId
        direction
        originStopId
        departureDate
        departureTime
        uniqueVehicleId
        _numInstance
      }
      originDepartureTime {
        departureDate
        departureDateTime
        departureTime
        id
        isNextDay
      }
      observedDepartureTime {
        id
        departureDate
        departureTime
        departureDateTime
        departureTimeDifference
        loc
      }
      plannedDepartureTime {
        id
        departureDate
        departureTime
        departureDateTime
      }
    }
  }
  ${CancellationFieldsFragment}
`;

const TimetableFilters = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-end;
`;

const RouteFilterContainer = styled.div`
  flex: 1 1 50%;

  label {
    font-size: 0.75rem;
  }
`;

const TimeRangeFilterContainer = styled.div`
  flex: 1 1 50%;
  display: flex;

  > * {
    margin-right: 0;
    margin-left: 0.5rem;
  }

  label {
    font-size: 0.75rem;
  }
`;

const ApplyButton = styled(Button).attrs({small: true, primary: true})`
  margin-left: 0.5rem;
  margin-bottom: 1px;
  width: 85px;
`;

function intOrUndefined(val) {
  return !val ? undefined : typeof val === "string" ? parseInt(val, 10) : val;
}

const renderTimetableRow = ({
  departure,
  index,
  key,
  style,
  isScrolling,
  isVisible,
  departureProps,
}) => (
  <div
    style={style}
    key={key}
    data-testid={`${index === 0 ? "first-timetable" : ""} departure-item`}>
    <StopDepartureItem
      isScrolling={isScrolling}
      isVisible={isVisible}
      departure={departure}
      {...departureProps}
    />
  </div>
);

const decorate = flow(observer, inject("Filters", "Journey", "Time"));

const StopDepartures = decorate(({state, Filters, Journey, Time}) => {
  const {
    date,
    selectedJourney,
    stop: stopId,
    terminal: terminalId,
    timetableFilters,
  } = state;

  const filterValues = Object.values(timetableFilters || {});

  const filterButtonClears =
    filterValues.some((v) => v.current !== "") &&
    filterValues.every((v) => v.current === v.pending);

  useEffect(() => {
    return setResetListener(Filters.clearTimetableFilters);
  }, []);

  const selectAsJourney = useCallback(
    (departure) => (e) => {
      e.preventDefault();

      if (!departure) {
        return;
      }

      const currentTime = get(
        departure,
        "observedDepartureTime.departureTime",
        get(departure, "plannedDepartureTime.departureTime", "")
      );

      if (currentTime) {
        Time.setTime(currentTime);
      }

      let journey = departure.journey || null;

      if (departure.originDepartureTime) {
        journey = createCompositeJourney(
          departure.originDepartureTime.departureDate,
          departure,
          departure.originDepartureTime.departureTime,
          get(journey, "uniqueVehicleId", "")
        );
      }

      const matchVehicle = !!journey.uniqueVehicleId;
      const selectedJourneyId = getJourneyId(selectedJourney, matchVehicle);

      if (journey && getJourneyId(journey, matchVehicle) !== selectedJourneyId) {
        Journey.setSelectedJourney(journey);
      } else {
        Journey.setSelectedJourney(null);
      }
    },
    [selectedJourney, Journey]
  );

  const setHourFilter = useCallback((which, value) => {
    const numValue = intval(value);
    const useValue = numValue < 0 || numValue > 28 ? "" : numValue;
    Filters.setTimetableFilter(which, useValue);
  });

  const setRouteFilter = useCallback((e) => {
    const value = get(e, "target.value", e);
    Filters.setTimetableFilter("route", value);
  }, []);

  const setMinHourFilter = useCallback((e) => {
    setHourFilter("minHour", get(e, "target.value", ""));
  }, []);

  const setMaxHourFilter = useCallback((e) => {
    setHourFilter("maxHour", get(e, "target.value", ""));
  }, []);

  const {minHour = {current: ""}, maxHour = {current: ""}, route = {current: ""}} =
    timetableFilters || {};

  const {data: departuresData, loading: departuresLoading} = useQueryData(
    departuresQuery,
    {
      skip: (!stopId && !terminalId) || !date,
      variables: {
        stopId: !terminalId ? stopId : undefined,
        terminalId: !stopId ? terminalId : undefined,
        date,
        routeId: route.current || undefined,
        minHour: intOrUndefined(minHour.current),
        maxHour: intOrUndefined(maxHour.current),
      },
    },
    "stop departures"
  );

  const departures = !departuresData || departuresData.length === 0 ? [] : departuresData;

  const selectedJourneyId = getJourneyId(selectedJourney);

  const focusedDeparture = selectedJourneyId
    ? departures.find(
        (departure) => selectedJourneyId === getJourneyId(departure.journey || departure)
      )
    : getDepartureByTime(departures, state.time);

  const focusedIndex = focusedDeparture
    ? departures.findIndex((departure) => departure === focusedDeparture)
    : -1;

  return (
    <VirtualizedSidepanelList
      testId="stop-departures-list"
      date={date}
      scrollToIndex={focusedIndex !== -1 ? focusedIndex : undefined}
      list={departures}
      renderRow={(rowProps) =>
        renderTimetableRow({
          departure: departures[rowProps.index],
          departureProps: {
            selectedJourney,
            onClick: selectAsJourney,
            date,
          },
          ...rowProps,
        })
      }
      rowHeight={32}
      loading={departuresLoading}
      header={
        <Observer>
          {() => (
            <TimetableFilters data-testid="timetable-filters">
              <RouteFilterContainer>
                <Input
                  value={route.pending}
                  animatedLabel={false}
                  onChange={setRouteFilter}
                  label={text("domain.route")}
                />
              </RouteFilterContainer>
              <TimeRangeFilterContainer>
                <Input
                  type="number"
                  value={minHour.pending}
                  animatedLabel={false}
                  label={`${text("general.timerange.min")} ${text("general.hour")}`}
                  onChange={setMinHourFilter}
                />
                <Input
                  type="number"
                  value={maxHour.pending}
                  animatedLabel={false}
                  label={`${text("general.timerange.max")} ${text("general.hour")}`}
                  onChange={setMaxHourFilter}
                />
              </TimeRangeFilterContainer>
              <ApplyButton
                onClick={
                  filterButtonClears
                    ? Filters.clearTimetableFilters
                    : Filters.applyTimetableFilters
                }>
                {filterButtonClears ? text("general.clear") : text("general.apply")}
              </ApplyButton>
            </TimetableFilters>
          )}
        </Observer>
      }
    />
  );
});

export default StopDepartures;
