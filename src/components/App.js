import React, {Component} from "react";
import "./App.css";
import get from "lodash/get";
import {LeafletMap} from "./LeafletMap";
import {FilterPanel} from "./FilterPanel";
import RouteQuery from "../queries/RouteQuery";
import moment from "moment";
import RouteLayer from "./RouteLayer";
import StopLayer from "./StopLayer";
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

  static getDerivedStateFromProps({queryDate}, {prevQueryDate, selectedVehicle}) {
    if (!selectedVehicle || !prevQueryDate) {
      return null;
    }

    if (queryDate !== prevQueryDate && !!selectedVehicle) {
      return {
        prevQueryDate: queryDate,
        selectedVehicle: null,
      };
    }

    return null;
  }

  constructor() {
    super();
    this.state = {
      prevQueryDate: "",
      playing: false,
      queryTime: "12:30:00",
      stop: defaultStop,
      selectedVehicle: null,
      map: defaultMapPosition,
      bbox: null,
      timeIncrement: 5,
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

  onMapChanged = ({target}) => {
    const bounds = target.getBounds();
    const zoom = target.getZoom();

    this.setState({
      map: {...this.state.map, zoom},
      bbox: {
        minLat: bounds.getSouth(),
        minLon: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLon: bounds.getEast(),
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

  setTimeIncrement = ({target}) => {
    this.setState({
      timeIncrement: target.value,
    });
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
      .add(this.state.timeIncrement, "seconds")
      .format("HH:mm:ss");

    this.setState({
      queryTime: nextQueryTime,
    });
  };

  componentDidUpdate() {
    if (this.state.playing && !this.autoplayTimerHandle) {
      // timer() is a setInterval alternative that uses requestAnimationFrame.
      // This makes it more performant and can "pause" when the tab is not focused.
      this.autoplayTimerHandle = timer(() => this.autoplay(), 1000);
    } else if (!this.state.playing && !!this.autoplayTimerHandle) {
      cancelAnimationFrame(this.autoplayTimerHandle.value);
      this.autoplayTimerHandle = null;
    }
  }

  render() {
    const {
      map,
      playing,
      timeIncrement,
      stop,
      queryTime,
      selectedVehicle,
    } = this.state;

    const {
      route,
      line,
      queryDate,
      onRouteSelected,
      onLineSelected,
      onDateSelected,
      hfpPositions,
      loading,
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
          timeIncrement={timeIncrement}
          setTimeIncrement={this.setTimeIncrement}
          onClickPlay={this.toggleAutoplay}
          onDateSelected={onDateSelected}
          onChangeQueryTime={this.onChangeQueryTime}
          onLineSelected={onLineSelected}
          onRouteSelected={onRouteSelected}
          onStopSelected={this.onStopSelected}
        />
        <LeafletMap position={map} onMapChanged={this.onMapChanged}>
          {!route.routeId &&
            map.zoom > 15 && (
              <StopLayer
                queryDate={queryDate}
                onLineSelected={onLineSelected}
                onRouteSelected={onRouteSelected}
                bounds={this.state.bbox}
              />
            )}
          <RouteLayer
            route={route}
            setMapBounds={this.setMapBounds}
            mapBounds={map.bounds}
            key={`routes_${route.routeId}_${route.direction}_${stop.stopId}`}
            onChangeQueryTime={this.onChangeQueryTime}
            queryDate={queryDate}
            queryTime={queryTime}
            hfpPositions={hfpPositions}
            selectedStop={stop}
          />
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
        <LoadingOverlay show={loading} message="Ladataan HFP-tietoja..." />
      </div>
    );
  }
}

export default App;
