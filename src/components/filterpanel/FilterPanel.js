import React, {Component} from "react";
import "./FilterPanel.css";
import LineInput from "./LineInput";
import StopInput from "./StopInput";
import {RouteInput} from "./RouteInput";
import RoutesByLineQuery from "../../queries/RoutesByLineQuery";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";
import Header from "./Header";
import DateSettings from "./DateSettings";
import TimeSettings from "./TimeSettings";
import AllLinesQuery from "../../queries/AllLinesQuery";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import JourneyList from "./JourneyList";

@inject(app("Filters", "UI"))
@observer
class FilterPanel extends Component {
  toggleVisibility = (e) => {
    e.preventDefault();
    this.props.UI.toggleFilterPanel();
  };

  onChangeQueryVehicle = ({target}) => {
    this.props.Filters.setVehicle(target.value);
  };

  render() {
    const {state, Filters} = this.props;
    const {vehicle, stop, route, line, date, filterPanelVisible: visible} = state;

    return (
      <header
        className={`transitlog-header filter-panel ${visible ? "visible" : ""}`}>
        <Header />
        <button onClick={Filters.reset}>Reset</button>
        <DateSettings />
        <TimeSettings />
        <p>
          <input
            type="text"
            name="vehicle"
            value={vehicle}
            onChange={this.onChangeQueryVehicle}
          />
        </p>
        {!!route.routeId ? (
          <StopsByRouteQuery key="stop_input_by_route" route={route}>
            {({stops}) => (
              <StopInput onSelect={Filters.setStop} stop={stop} stops={stops} />
            )}
          </StopsByRouteQuery>
        ) : (
          <AllStopsQuery key="all_stops">
            {({stops}) => (
              <StopInput onSelect={Filters.setStop} stop={stop} stops={stops} />
            )}
          </AllStopsQuery>
        )}
        <AllLinesQuery date={date}>
          {({lines, loading, error}) => {
            if (loading || error) {
              return null;
            }

            return (
              <LineInput line={line} onSelect={Filters.setLine} lines={lines} />
            );
          }}
        </AllLinesQuery>
        {line.lineId &&
          line.dateBegin && (
            <RoutesByLineQuery line={line}>
              {({routes, loading, error}) => {
                if (loading || error) {
                  return null;
                }

                return <RouteInput route={route} routes={routes} />;
              }}
            </RoutesByLineQuery>
          )}
        <JourneyList />
        <button className="toggle-filter-panel" onClick={this.toggleVisibility}>
          {visible ? "<" : ">"}
        </button>
      </header>
    );
  }
}

export default FilterPanel;
