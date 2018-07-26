import React, {Component} from "react";
import "./App.css";
import get from "lodash/get";
import {LeafletMap} from "./LeafletMap";
import {FilterPanel} from "./FilterPanel";
import RouteQuery from "../queries/RouteQuery";
import moment from "moment";
import RouteLayer from "./RouteLayer";
import HfpMarkerLayer from "./HfpMarkerLayer";
import timer from "../helpers/timer";
import LoadingOverlay from "./LoadingOverlay";
import HfpLayer from "./HfpLayer";

const defaultStop = {
  stopId: "",
  shortId: "",
  lat: "",
  lon: "",
  nameFi: "",
  stopIndex: 0,
};

const defaultMapPosition = {lat: 60.170988, lng: 24.940842, zoom: 13, bounds: null};

class App extends Component {
  autoplayTimerHandle = null;
  loadingTimerHandle = null;

  componentDidUpdate({loading: prevLoading}) {
    const {loading} = this.props;

    if (loading && loading !== prevLoading && !this.loadingTimerHandle) {
      this.loadingTimerHandle = setTimeout(() => {
        this.setState({
          showLoading: true,
        });
      }, 1000);
    } else if (this.loadingTimerHandle && !loading) {
      console.log("Cancel loading timer");
      clearTimeout(this.loadingTimerHandle);
      this.loadingTimerHandle = null;
    }
  }

  constructor() {
    super();
    this.state = {
      showLoading: false,
      playing: false,
      queryTime: "12:30:00",
      stop: defaultStop,
      selectedVehicle: null,
      map: defaultMapPosition,
    };
  }

  onChangeQueryTime = (queryTime) => {
    this.setState({queryTime});
  };

  onStopSelected = (stop) => {
    this.setState({
      stop,
      map: {
        zoom: !!stop ? 16 : 13,
        lat: get(stop, "lat", defaultMapPosition.lat),
        lng: get(stop, "lon", defaultMapPosition.lng),
      },
    });
  };

  selectVehicle = (vehiclePosition = null) => {
    this.setState({
      selectedVehicle: vehiclePosition,
    });
  };

  toggleAutoplay = (e) => {
    this.setState({playing: !this.state.playing});
  };

  setMapBounds = (bounds = null) => {
    if (bounds) {
      this.setState({
        map: {
          ...this.state.map,
          bounds,
        },
      });
    }
  };

  autoplay = () => {
    const nextQueryTime = moment(this.state.queryTime, "HH:mm:ss")
      .add(10, "seconds")
      .format("HH:mm:ss");

    this.setState({
      queryTime: nextQueryTime,
    });
  };

  componentDidUpdate() {
    if (this.state.playing && !this.autoplayTimerHandle) {
      this.autoplayTimerHandle = timer(() => this.autoplay(), 1000);
    } else if (!this.state.playing && !!this.autoplayTimerHandle) {
      cancelAnimationFrame(this.autoplayTimerHandle.value);
      this.autoplayTimerHandle = null;
    }
  }

  render() {
    const {showLoading, map, playing, stop, queryTime, selectedVehicle} = this.state;

    const {
      route,
      line,
      queryDate,
      onRouteSelected,
      onLineSelected,
      onDateSelected,
      hfpPositions,
    } = this.props;

    return (
      <div className="transitlog">
        <FilterPanel
          queryDate={queryDate}
          queryTime={queryTime}
          line={line}
          route={route}
          stop={stop}
          isPlaying={playing}
          onClickPlay={this.toggleAutoplay}
          onDateSelected={onDateSelected}
          onChangeQueryTime={this.onChangeQueryTime}
          onLineSelected={onLineSelected}
          onRouteSelected={onRouteSelected}
          onStopSelected={this.onStopSelected}
        />
        <LeafletMap position={map}>
          <RouteQuery route={route}>
            {({routePositions, stops}) => (
              <RouteLayer
                setMapBounds={this.setMapBounds}
                mapBounds={map.bounds}
                key={`routes_${route.routeId}_${route.direction}_${stop.stopId}`}
                onChangeQueryTime={this.onChangeQueryTime}
                queryDate={queryDate}
                queryTime={queryTime}
                hfpPositions={hfpPositions}
                positions={routePositions}
                stops={stops}
                selectedStop={stop}
              />
            )}
          </RouteQuery>
          {hfpPositions.length > 0 &&
            hfpPositions.map((positionGroup) => (
              <React.Fragment
                key={`hfp_group_${positionGroup.groupName}_${route.routeId}_${
                  route.direction
                }`}>
                {get(selectedVehicle, "uniqueVehicleId", null) ===
                  positionGroup.groupName && (
                  <HfpLayer
                    key={`hfp_lines_${positionGroup.groupName}`}
                    selectedVehicle={selectedVehicle}
                    positions={positionGroup.positions}
                    name={positionGroup.groupName}
                  />
                )}
                <HfpMarkerLayer
                  onMarkerClick={this.selectVehicle}
                  selectedVehicle={selectedVehicle}
                  queryDate={queryDate}
                  queryTime={queryTime}
                  positions={positionGroup.positions}
                  name={positionGroup.groupName}
                />
              </React.Fragment>
            ))}
        </LeafletMap>
        {showLoading && <LoadingOverlay message="Ladataan HFP tietoja..." />}
      </div>
    );
  }
}

export default App;
