import React, {Component} from "react";
import get from "lodash/get";
import FilterPanel from "./filterpanel/FilterPanel";
import LoadingOverlay from "./LoadingOverlay";
import "./App.css";
import "./Form.css";
import withHfpData from "../hoc/withHfpData";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import Map from "./map/Map";
import {latLng} from "leaflet";
import getCoarsePositionForTime from "../helpers/getCoarsePositionForTime";
import StopLayer from "./map/StopLayer";
import RouteQuery from "../queries/RouteQuery";
import RouteLayer from "./map/RouteLayer";
import HfpLayer from "./map/HfpLayer";
import HfpMarkerLayer from "./map/HfpMarkerLayer";
import invoke from "lodash/invoke";
import getJourneyId from "../helpers/getJourneyId";

@inject(app("Journey", "Filters"))
@withHfpData
@observer
class App extends Component {
  state = {
    stopsBbox: null,
  };

  onMapChanged = (map) => {
    const {route} = this.props.state;

    if (!route.routeId && map.getZoom() > 14) {
      this.setStopsBbox(map);
    }
  };

  setStopsBbox = (map) => {
    if (!map) {
      return;
    }

    const bounds = map.getBounds();

    if (!bounds || !invoke(bounds, "isValid")) {
      return;
    }

    this.setState({
      stopsBbox: {
        minLat: bounds.getSouth(),
        minLon: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLon: bounds.getEast(),
      },
    });
  };

  getJourneyPosition = () => {
    const {
      state: {selectedJourney, date, time},
      positionsByJourney,
    } = this.props;

    let journeyPosition = null;

    if (selectedJourney) {
      const journeyId = getJourneyId(selectedJourney);
      const timeDate = new Date(`${date}T${time}`);

      const pos = getCoarsePositionForTime(positionsByJourney, journeyId, timeDate);

      if (pos) {
        journeyPosition = latLng([pos.lat, pos.long]);
      }
    }

    return journeyPosition;
  };

  onClickVehicleMarker = (journey) => {
    const {Journey, Filters, state} = this.props;

    if (journey && getJourneyId(state.selectedJourney) !== getJourneyId(journey)) {
      Filters.setVehicle(journey.uniqueVehicleId);
    } else {
      Filters.setVehicle("");
    }

    Journey.setSelectedJourney(journey);
  };

  render() {
    const {stopsBbox} = this.state;
    const {loading, state, positionsByVehicle, positionsByJourney} = this.props;
    const {route, vehicle, stop, selectedJourney} = state;

    const journeyPosition = this.getJourneyPosition();

    return (
      <div className="transitlog">
        <FilterPanel />
        <Map onMapChanged={this.onMapChanged} center={journeyPosition}>
          {({lat, lng, zoom, setMapBounds}) => (
            <React.Fragment>
              {!route.routeId &&
                zoom > 14 && <StopLayer selectedStop={stop} bounds={stopsBbox} />}
              <RouteQuery route={route}>
                {({routePositions, stops}) =>
                  routePositions.length !== 0 ? (
                    <RouteLayer
                      routePositions={routePositions}
                      stops={stops}
                      setMapBounds={setMapBounds}
                      key={`route_line_${route.routeId}`}
                      positionsByVehicle={positionsByVehicle}
                      positionsByJourney={positionsByJourney}
                    />
                  ) : null
                }
              </RouteQuery>
              {positionsByJourney.length > 0 &&
                positionsByJourney.map(({positions, journeyId}) => {
                  if (
                    vehicle &&
                    get(positions, "[0].uniqueVehicleId", "") !== vehicle
                  ) {
                    return null;
                  }

                  const isSelectedJourney =
                    selectedJourney && getJourneyId(selectedJourney) === journeyId;

                  return [
                    isSelectedJourney ? (
                      <HfpLayer
                        key={`hfp_line_${journeyId}`}
                        selectedJourney={selectedJourney}
                        positions={positions}
                        name={journeyId}
                      />
                    ) : null,
                    <HfpMarkerLayer
                      key={`hfp_markers_${journeyId}`}
                      onMarkerClick={this.onClickVehicleMarker}
                      positions={positions}
                      name={journeyId}
                    />,
                  ];
                })}
            </React.Fragment>
          )}
        </Map>
        <LoadingOverlay show={loading} message="Ladataan HFP-tietoja..." />
      </div>
    );
  }
}

export default App;
