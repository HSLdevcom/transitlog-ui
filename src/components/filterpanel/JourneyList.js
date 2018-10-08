import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import withHfpData from "../../hoc/withHfpData";
import map from "lodash/map";
import get from "lodash/get";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";
import format from "date-fns/format";
import parse from "date-fns/parse";
import {timeToFormat} from "../../helpers/time";
import {Text} from "../../helpers/text";
import withDepartures from "../../hoc/withDepartures";

@inject(app("Journey", "Time", "Filters"))
@withHfpData
@withDepartures
@observer
class JourneyList extends Component {
  componentDidMount() {
    this.ensureSelectedVehicle();
  }

  componentDidUpdate() {
    this.ensureSelectedVehicle();
  }

  ensureSelectedVehicle = () => {
    const {Filters, state, positions} = this.props;
    const {vehicle, selectedJourney} = state;

    if (!selectedJourney) {
      if (vehicle !== "") {
        Filters.setVehicle("");
      }

      return;
    }

    const selectedJourneyId = getJourneyId(selectedJourney);
    const journeys = map(positions, ({positions}) => positions[0]);
    const journey = journeys.find((j) => getJourneyId(j) === selectedJourneyId);

    // Only set these if the journey is truthy and was not already selected
    if (journey && journey.unique_vehicle_id !== vehicle) {
      Filters.setVehicle(journey.unique_vehicle_id);
    }
  };

  selectJourney = (journey) => (e) => {
    e.preventDefault();
    const {Time, Journey, state} = this.props;

    // Only set these if the journey is truthy and was not already selected
    if (journey && getJourneyId(state.selectedJourney) !== getJourneyId(journey)) {
      Time.setTime(
        timeToFormat(journey.journey_start_timestamp, "HH:mm:ss", "Europe/Helsinki")
      );
    }

    Journey.setSelectedJourney(journey);
  };

  getJourneyStartPosition(journeyId) {
    const {positions} = this.props;

    // Get the hfp data for this journey
    const journeyPositions = get(
      positions.find(({journeyId: jid}) => jid === journeyId),
      "positions",
      []
    );

    // Default to the first hfp event, ie when the data stream from this vehicle started
    let journeyStartHfp = journeyPositions[0];

    if (!journeyStartHfp) {
      return null;
    }

    for (let i = 1; i < journeyPositions.length; i++) {
      const current = journeyPositions[i];

      // Loop through the positions and find when the next_stop_id prop changes.
      // The hfp event BEFORE this is when the journey started, ie when
      // the vehicle departed the first terminal.
      if (current && current.next_stop_id !== journeyStartHfp.next_stop_id) {
        journeyStartHfp = journeyPositions[i - 1];
        break;
      }
    }

    return journeyStartHfp;
  }

  render() {
    const {positions, state} = this.props;

    const journeys = map(positions, ({positions}) => positions[0]);
    const selectedJourney = get(state, "selectedJourney");
    const selectedJourneyId = getJourneyId(selectedJourney);

    const isSelected = (journey) =>
      selectedJourney && selectedJourneyId === getJourneyId(journey);

    return (
      <div className="journey-list">
        <div className="journey-list-row header">
          <strong className="start-time">
            <Text>filterpanel.planned_start_time</Text>
          </strong>
          <span>
            <Text>filterpanel.real_start_time</Text>
          </span>
        </div>
        {journeys.map((journey) => {
          const journeyStartHfp = this.getJourneyStartPosition(
            getJourneyId(journey)
          );

          return (
            <button
              className={`journey-list-row ${isSelected(journey) ? "selected" : ""}`}
              key={`journey_row_${getJourneyId(journey)}`}
              onClick={this.selectJourney(journey)}>
              <strong className="start-time">
                {timeToFormat(
                  journey.journey_start_timestamp,
                  "HH:mm:ss",
                  "Europe/Helsinki"
                )}
              </strong>
              {journeyStartHfp && (
                <span>
                  {timeToFormat(
                    journeyStartHfp.received_at,
                    "HH:mm:ss",
                    "Europe/Helsinki"
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
}

export default JourneyList;
