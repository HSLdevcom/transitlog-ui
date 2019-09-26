import React, {Component} from "react";
import {observer, inject, Observer} from "mobx-react";
import {app} from "mobx-app";
import {toJS, reaction, observable, action} from "mobx";
import styled from "styled-components";
import Input from "../Input";
import {text} from "../../helpers/text";
import get from "lodash/get";
import {getUrlValue, setUrlValue} from "../../stores/UrlManager";
import {Button} from "../Forms";
import {setResetListener} from "../../stores/FilterStore";
import VirtualizedSidepanelList from "./VirtualizedSidepanelList";
import TimetableDeparture from "./TimetableDeparture";
import {getDepartureByTime} from "../../helpers/getDepartureByTime";
import getJourneyId from "../../helpers/getJourneyId";
import DeparturesQuery from "../../queries/DeparturesQuery";
import {withStop} from "../../hoc/withStop";
import {createCompositeJourney} from "../../stores/journeyActions";

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
`;

function intOrUndefined(val) {
  return !val ? undefined : typeof val === "string" ? parseInt(val, 10) : val;
}

@inject(app("Filters", "Journey", "Time"))
@withStop
@observer
class TimetablePanel extends Component {
  removeResetListener = () => {};
  disposeScrollResetReaction = () => {};
  updateScrollOffset = () => {};
  disposeChangeListener = () => {};

  // Input value for the timerange filter. This will be copied to the filterValues
  // prop when the apply button is clicked. It does not affect the search before that.
  @observable
  routeFilter = getUrlValue("timetableRoute", "");

  // Input values for the timerange filter. These will be copied to the filterValues
  // prop when the apply button is clicked. They do not affect the search before that.
  @observable
  timeRangeFilter = {
    min: getUrlValue("timetableTimeRange.min", undefined),
    max: getUrlValue("timetableTimeRange.max", undefined),
  };

  // These are the values that will actually be used in the query to filter the result.
  // The apply button assigns the values from the props above which triggers a fetch.
  @observable
  filterValues = {
    routeId: getUrlValue("timetableRoute", ""),
    minHour: getUrlValue("timetableTimeRange.min", undefined),
    maxHour: getUrlValue("timetableTimeRange.max", undefined),
  };

  // When this is true, the apply button will instead clear the inputs.
  // Check the URL for url filters and set it to true if there are any.
  @observable
  filterButtonClears =
    getUrlValue("timetableRoute", "") ||
    getUrlValue("timetableTimeRange.min", "") ||
    getUrlValue("timetableTimeRange.max", "");

  // We DON'T want this component to react to time changes,
  // as there is a lot to render and it would be too heavy.
  reactionlessTime = toJS(this.props.state.time);

  componentDidMount() {
    const {state} = this.props;
    this.removeResetListener = setResetListener(this.onClearFilters);

    this.disposeScrollResetReaction = reaction(
      () => [this.timeRangeFilter, this.routeFilter],
      () => this.updateScrollOffset(true),
      {delay: 1}
    );

    // Clear the filters when some state changes.
    this.disposeChangeListener = reaction(
      () => [state.route.routeId, state.stop, state.date],
      () => {
        this.onClearFilters();
      }
    );
  }

  componentWillUnmount() {
    // Always dispose reactions to prevent memory leaks. This component might mount
    // an unmount often, so it is very important to do it here.
    this.disposeScrollResetReaction();

    // Dispose the reset listener
    this.removeResetListener();

    this.disposeChangeListener();
  }

  @action
  setRouteFilter = (e) => {
    const value = get(e, "target.value", e);
    this.routeFilter = value;

    // When this value changes, set the apply button to apply
    // mode if it wasn't so we can update the search.
    if (this.filterButtonClears) {
      this.filterButtonClears = false;
    }

    setUrlValue("timetableRoute", value);
  };

  @action
  setTimeRangeFilter = (which) => (e) => {
    const value = e.target.value;
    // We need the reverse of the current field. Max is the
    // reverse of min, and min is the reverse of max.
    const reverse = which === "min" ? "max" : "min";

    // If the time is not a valid number, make it empty.
    const setValue = value < 0 ? "" : value;

    // The time range value is set as an object.
    this.timeRangeFilter = {
      [reverse]: this.timeRangeFilter[reverse],
      [which]: setValue,
    };

    // When this value changes, set the apply button to apply
    // mode if it wasn't so we can update the search.
    if (this.filterButtonClears) {
      this.filterButtonClears = false;
    }

    setUrlValue(`timetableTimeRange.${which}`, setValue);
  };

  // This action copies the input values for the filters to the
  @action
  onApplyFilters = () => {
    const routeId = this.routeFilter;
    const minHour = this.timeRangeFilter.min;
    const maxHour = this.timeRangeFilter.max;

    this.filterValues = {
      routeId,
      minHour: intOrUndefined(minHour),
      maxHour: intOrUndefined(maxHour),
    };

    if (!this.filterButtonClears) {
      this.filterButtonClears = true;
    }
  };

  onClearFilters = () => {
    this.timeRangeFilter = {min: "", max: ""};
    this.routeFilter = "";
    this.filterValues = {
      minHour: "",
      maxHour: "",
      routeId: "",
    };

    if (this.filterButtonClears) {
      this.filterButtonClears = false;
    }

    setUrlValue(`timetableTimeRange.min`, null);
    setUrlValue(`timetableTimeRange.max`, null);
    setUrlValue(`timetableRoute`, null);
  };

  selectAsJourney = (departure) => (e) => {
    e.preventDefault();

    if (!departure) {
      return;
    }

    const {
      Journey,
      Time,
      state: {selectedJourney},
    } = this.props;

    const currentTime = get(
      departure,
      "observedDepartureTime.departureTime",
      get(departure, "plannedDepartureTime.departureTime", "")
    );

    if (currentTime) {
      Time.setTime(currentTime);
    }

    const journey =
      departure.journey ||
      createCompositeJourney(
        departure.plannedDepartureTime.departureDate,
        departure,
        departure.plannedDepartureTime.departureTime
      );

    const selectedJourneyId = getJourneyId(selectedJourney, false);

    if (journey && getJourneyId(journey, false) !== selectedJourneyId) {
      Journey.setSelectedJourney(journey);
    } else {
      Journey.setSelectedJourney(null);
    }
  };

  renderRow = (props) => (list) => ({key, index, style, isScrolling, isVisible}) => {
    const departure = list[index];
    const instance = get(departure, "journey.instance", 0);
    const departureTime = get(departure, "plannedDepartureTime.departureDateTime", "");

    return (
      <div style={style} key={key} data-testid={index === 0 ? "first-timetable" : ""}>
        <TimetableDeparture
          key={`departure_${departure.departureId}_${departure.routeId}_${departure.direction}_${departureTime}_${instance}`}
          isScrolling={isScrolling}
          isVisible={isVisible}
          departure={departure}
          {...props}
        />
      </div>
    );
  };

  renderList = (departures, renderRow, loading, focusedIndex) => {
    const {
      state: {date, stop: stopId},
    } = this.props;

    return stopId ? (
      <VirtualizedSidepanelList
        date={date}
        scrollToIndex={focusedIndex !== -1 ? focusedIndex : undefined}
        list={departures}
        renderRow={renderRow(departures)}
        rowHeight={32}
        loading={loading}
        header={
          <Observer>
            {() => (
              <TimetableFilters>
                <RouteFilterContainer>
                  <Input
                    value={this.routeFilter}
                    animatedLabel={false}
                    onChange={this.setRouteFilter}
                    label={text("domain.route")}
                  />
                </RouteFilterContainer>
                <TimeRangeFilterContainer>
                  <Input
                    type="number"
                    value={this.timeRangeFilter.min}
                    animatedLabel={false}
                    label={`${text("general.timerange.min")} ${text("general.hour")}`}
                    onChange={this.setTimeRangeFilter("min")}
                  />
                  <Input
                    type="number"
                    value={this.timeRangeFilter.max}
                    animatedLabel={false}
                    label={`${text("general.timerange.max")} ${text("general.hour")}`}
                    onChange={this.setTimeRangeFilter("max")}
                  />
                </TimeRangeFilterContainer>
                <ApplyButton
                  onClick={
                    this.filterButtonClears ? this.onClearFilters : this.onApplyFilters
                  }>
                  {this.filterButtonClears
                    ? text("general.clear")
                    : text("general.apply")}
                </ApplyButton>
              </TimetableFilters>
            )}
          </Observer>
        }
      />
    ) : (
      "No departures."
    );
  };

  render() {
    const {
      stop,
      stopLoading,
      state: {date, selectedJourney, stop: stopId},
    } = this.props;

    const {minHour, maxHour, routeId} = this.filterValues;

    return (
      <DeparturesQuery
        stopId={stopId}
        date={date}
        routeId={routeId || undefined}
        minHour={intOrUndefined(minHour)}
        maxHour={intOrUndefined(maxHour)}>
        {({departures = [], loading}) => {
          const selectedJourneyId = getJourneyId(selectedJourney, false);

          const focusedDeparture = selectedJourneyId
            ? departures.find(
                (departure) =>
                  selectedJourneyId ===
                  getJourneyId(departure.journey || departure, false)
              )
            : getDepartureByTime(departures, this.reactionlessTime);

          const focusedIndex = focusedDeparture
            ? departures.findIndex((departure) => departure === focusedDeparture)
            : -1;

          const rowRenderer = this.renderRow({
            selectedJourney,
            onClick: this.selectAsJourney,
            date,
            stop,
          });

          return this.renderList(
            departures,
            rowRenderer,
            loading || stopLoading,
            focusedIndex
          );
        }}
      </DeparturesQuery>
    );
  }
}

export default TimetablePanel;
