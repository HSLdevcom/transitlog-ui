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
import TimetableDeparture from "./TimetableDeparture";
import {getDepartureByTime} from "../../helpers/getDepartureByTime";
import getJourneyId from "../../helpers/getJourneyId";
import DeparturesQuery from "../../queries/DeparturesQuery";
import {withStop} from "../../hoc/withStop";
import {createCompositeJourney} from "../../stores/journeyActions";
import {inject} from "../../helpers/inject";
import {intval} from "../../helpers/isWithinRange";

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
}) => {
  const instance = get(departure, "journey.instance", 0);
  const departureTime = get(departure, "plannedDepartureTime.departureDateTime", "");

  return (
    <div
      style={style}
      key={key}
      data-testid={`${index === 0 ? "first-timetable" : ""} departure-item`}>
      <TimetableDeparture
        key={`departure_${departure.departureId}_${departure.routeId}_${departure.direction}_${departureTime}_${instance}`}
        isScrolling={isScrolling}
        isVisible={isVisible}
        departure={departure}
        {...departureProps}
      />
    </div>
  );
};

const decorate = flow(
  observer,
  withStop,
  inject("Filters", "Journey", "Time")
);

const TimetablePanel = decorate(({stop, state, Filters, Journey, Time}) => {
  const {date, selectedJourney, stop: stopId, timetableFilters} = state;

  const filterValues = Object.values(timetableFilters);
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
          departure.originDepartureTime.departureTime
        );
      }

      const selectedJourneyId = getJourneyId(selectedJourney, false);

      if (journey && getJourneyId(journey, false) !== selectedJourneyId) {
        Journey.setSelectedJourney(journey);
      } else {
        Journey.setSelectedJourney(null);
      }
    },
    []
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

  const {minHour, maxHour, route} = timetableFilters;

  return (
    <DeparturesQuery
      stopId={stopId}
      date={date}
      routeId={route.current || undefined}
      minHour={intOrUndefined(minHour.current)}
      maxHour={intOrUndefined(maxHour.current)}>
      {({departures = [], loading}) => (
        <Observer>
          {() => {
            const selectedJourneyId = getJourneyId(selectedJourney, false);

            const focusedDeparture = selectedJourneyId
              ? departures.find(
                  (departure) =>
                    selectedJourneyId ===
                    getJourneyId(departure.journey || departure, false)
                )
              : getDepartureByTime(departures, state.time);

            const focusedIndex = focusedDeparture
              ? departures.findIndex((departure) => departure === focusedDeparture)
              : -1;

            const createRowRenderer = (props) =>
              renderTimetableRow({
                departure: departures[props.index],
                departureProps: {
                  selectedJourney,
                  onClick: selectAsJourney,
                  date,
                  stop,
                },
                ...props,
              });

            return (
              <VirtualizedSidepanelList
                date={date}
                scrollToIndex={focusedIndex !== -1 ? focusedIndex : undefined}
                list={departures}
                renderRow={createRowRenderer}
                rowHeight={32}
                loading={loading}
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
                            label={`${text("general.timerange.min")} ${text(
                              "general.hour"
                            )}`}
                            onChange={setMinHourFilter}
                          />
                          <Input
                            type="number"
                            value={maxHour.pending}
                            animatedLabel={false}
                            label={`${text("general.timerange.max")} ${text(
                              "general.hour"
                            )}`}
                            onChange={setMaxHourFilter}
                          />
                        </TimeRangeFilterContainer>
                        <ApplyButton
                          onClick={
                            filterButtonClears
                              ? Filters.clearTimetableFilters
                              : Filters.applyTimetableFilters
                          }>
                          {filterButtonClears
                            ? text("general.clear")
                            : text("general.apply")}
                        </ApplyButton>
                      </TimetableFilters>
                    )}
                  </Observer>
                }
              />
            );
          }}
        </Observer>
      )}
    </DeparturesQuery>
  );
});

export default TimetablePanel;
