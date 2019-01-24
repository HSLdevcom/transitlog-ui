import {Component} from "react";
import {observer, inject} from "mobx-react";
import getJourneyId from "../../helpers/getJourneyId";
import get from "lodash/get";
import getCoarsePositionForTime from "../../helpers/getCoarsePositionForTime";
import {latLng} from "leaflet";
import {app} from "mobx-app";
import {runInAction, reaction, observable} from "mobx";
import {timeToSeconds} from "../../helpers/time";

let prevJourneyKey = "";
let prevTime = "";

@inject(app("state"))
@observer
class JourneyPosition extends Component {
  @observable
  journeyPosition = null;

  followReaction = () => {};

  getJourneyPosition = () => {
    const {
      state: {selectedJourney, time},
      positions = [],
    } = this.props;

    let journeyPosition = null;

    if (selectedJourney) {
      const journeyId = getJourneyId(selectedJourney);
      const currentSeconds = timeToSeconds(time);

      const journeyPositions = get(
        positions.find((j) => j.journeyId === journeyId),
        "events",
        []
      );

      const pos = getCoarsePositionForTime(journeyPositions, currentSeconds);

      if (pos) {
        journeyPosition = latLng([pos.lat, pos.long]);
      }
    }

    runInAction(() => (this.journeyPosition = journeyPosition));
  };

  componentDidMount() {
    const {state} = this.props;

    this.followReaction = reaction(
      () => {
        const {time, selectedJourney, live} = state;
        const selectedJourneyId = getJourneyId(selectedJourney);

        /*
        The idea here is to make the map center follow the HFP marker ONLY IF
        the current journey hasn't changed. These conditionals need to be
        in this exact order for this to work, otherwise the map may
        recenter when changing journeys, which we don't want.
         */

        // Bail if polling is enabled as it would be hard to move the map.
        if (live) {
          return false;
        }

        // 1. Change the journey key when the selected journey changes.
        if (
          !prevJourneyKey ||
          (selectedJourneyId && prevJourneyKey !== selectedJourneyId)
        ) {
          prevJourneyKey = selectedJourneyId;
          prevTime = time;
        } else if (!selectedJourney) {
          prevJourneyKey = "";
        }

        // 2. Allow following the selected journey if the journey ID is the same
        // BUT the time has changed.
        if (
          !!prevJourneyKey &&
          prevJourneyKey === selectedJourneyId &&
          prevTime !== time
        ) {
          prevTime = time;
          return time;
        }

        return false;
      },
      (followJourney) => {
        if (followJourney) {
          this.getJourneyPosition();
        }
      }
    );
  }

  componentWillUnmount() {
    if (typeof this.followReaction === "function") {
      // Dispose the reaction
      this.followReaction();
    }
  }

  render() {
    const {children} = this.props;
    return children(this.journeyPosition);
  }
}

export default JourneyPosition;
