import {Component} from "react";
import {observer, inject} from "mobx-react";
import {reaction, observable, action, computed} from "mobx";

@inject("state")
@observer
class JourneyPosition extends Component {
  positionReaction = () => {};
  positions = new Map();

  @observable
  hfpPositions = new Map();

  @computed get isLive() {
    // Determine if the app is live-updating or just simulating.
    const {live, timeIsCurrent} = this.props.state;
    return live && timeIsCurrent;
  }

  // Matches the current time setting with a HFP position from this journey.
  getHfpPositions = (time) => {
    if (this.positions.size === 0) {
      return;
    }

    this.positions.forEach((indexedEvents, journeyId) => {
      // Attempt to find the correct hfp item from the indexed positions
      let nextHfpPosition = indexedEvents.get(time);

      if (!nextHfpPosition) {
        // If no positions matched the current time exactly, look backwards and forwards
        // 10 seconds respectively to find a matching hfp event.
        nextHfpPosition = this.findHfpPosition(time, indexedEvents);
      }

      this.setHfpPosition(journeyId, nextHfpPosition);
    });
  };

  getLivePositions = (journeys) => {
    journeys.forEach(({journeyId, events = []}) => {
      if (events.length !== 0) {
        this.setHfpPosition(journeyId, events[events.length - 1]);
      }
    });
  };

  findHfpPosition = (time, indexedEvents) => {
    let i = 0;
    let checkSeconds = time;
    let nextHfpPosition = null;

    // Max iterations is 120, which means events can be at most 60 seconds before
    // or after i to be displayed.
    while (!nextHfpPosition && i <= 120) {
      // Alternately check after (even i) and before (odd i) `time`
      if (i % 2 === 0) {
        checkSeconds = time + Math.round(i / 2);
      } else {
        checkSeconds = time - Math.round(i / 2);
      }

      nextHfpPosition = indexedEvents.get(checkSeconds);

      i += 1;
    }

    return nextHfpPosition;
  };

  setHfpPosition = action((journeyId, nextHfpPosition) => {
    this.hfpPositions.set(journeyId, nextHfpPosition);
  });

  // Index the hfp events under their timestamp to make it easy to find them on the fly.
  // This is a performance optimization.
  indexPositions = (positions) => {
    return positions.reduce((positionIndex, position) => {
      const key = position.received_at_unix;
      positionIndex.set(key, position);
      return positionIndex;
    }, new Map());
  };

  indexJourneys = (journeys) => {
    this.positions = journeys.reduce(
      (journeyIndex, {journeyId = "", events = []}) => {
        journeyIndex.set(journeyId, this.indexPositions(events));
        return journeyIndex;
      },
      new Map()
    );
  };

  componentDidMount() {
    const {state, positions} = this.props;

    if (!this.isLive && positions.length !== 0) {
      // Index once when mounted if not live-updating
      this.indexJourneys(positions);
    } else if (this.isLive && positions.length !== 0) {
      this.getLivePositions(positions);
    }

    // A reaction to set the hfp event that matches the currently selected time
    this.positionReaction = reaction(
      () => [state.unixTime, this.isLive],
      ([time, live]) => {
        if (!live && time) {
          this.getHfpPositions(time);
        }
      },
      {fireImmediately: true}
    );
  }

  componentDidUpdate() {
    const {
      positions = [],
      state: {unixTime},
    } = this.props;

    // If the positions changed we need to index again.
    if (!this.isLive && positions.length !== 0) {
      this.indexJourneys(positions);
      this.getHfpPositions(unixTime);
    }

    if (this.isLive && positions.length !== 0) {
      this.getLivePositions(positions);
    }
  }

  componentWillUnmount() {
    if (typeof this.positionReaction === "function") {
      // Dispose the reaction
      this.positionReaction();
    }
  }

  render() {
    const {children} = this.props;
    return children(this.hfpPositions);
  }
}

export default JourneyPosition;
