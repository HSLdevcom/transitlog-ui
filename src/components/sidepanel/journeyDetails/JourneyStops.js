import React from "react";
import {observable, action} from "mobx";
import {observer} from "mobx-react";
import get from "lodash/get";
import sortBy from "lodash/sortBy";
import omit from "lodash/omit";
import styled from "styled-components";
import JourneyStop from "./JourneyStop";
import {Text} from "../../../helpers/text";
import {filterRouteSegments} from "../../../helpers/filterJoreCollections";

const JourneyStopsWrapper = styled.div`
  margin-left: ${({expanded}) => (expanded ? "0" : "calc(1.5rem - 1px)")};
  border-left: ${({expanded}) => (expanded ? "0" : "3px dotted var(--light-grey)")};
  padding: ${({expanded}) => (expanded ? "0" : "1rem 0")};
  position: relative;
`;

const StopsList = styled.div`
  padding: 0 0.5rem 0 0.5rem;
  width: 100%;
  color: var(--light-grey);
`;

const HiddenStopsMessage = styled.span`
  padding-left: 1.5rem;
`;

const JourneyExpandToggle = styled.button`
  position: absolute;
  top: ${({expanded}) => (expanded ? "-1.5rem" : "0")};
  left: 0;
  padding: 0;
  padding-left: ${({expanded}) => (expanded ? "1.5rem" : "0")};
  background: transparent;
  border: 0;
  font-family: inherit;
  color: white;
  text-decoration: underline dashed;
  color: var(--blue);
  transition: transform 0.1s ease-out;
  cursor: pointer;
  outline: none;
  text-align: left;

  &:hover {
    transform: scale(1.025);
  }
`;

@observer
class JourneyStops extends React.Component {
  @observable
  journeyIsExpanded = false;

  toggleJourneyExpanded = action((setTo = !this.journeyIsExpanded) => {
    this.journeyIsExpanded = setTo;
  });

  render() {
    const {journeyHfp, route, date, originDeparture, onClickTime} = this.props;
    const {dateBegin = "", dateEnd = "", departureId = 0} = originDeparture || {};

    const journeyStops = sortBy(
      filterRouteSegments(get(route, "routeSegments.nodes", []), date),
      "stopIndex"
    ).map((routeSegment) => {
      const stopDepartures = get(routeSegment, "stop.departures.nodes", []).filter(
        (departure) =>
          departure.dateBegin === dateBegin &&
          departure.dateEnd === dateEnd &&
          departure.departureId === departureId
      );

      return {
        destination: routeSegment.destinationFi,
        distanceFromPrevious: routeSegment.distanceFromPrevious,
        distanceFromStart: routeSegment.distanceFromStart,
        duration: routeSegment.duration,
        stopIndex: routeSegment.stopIndex,
        timingStopType: routeSegment.timingStopType,
        ...omit(get(routeSegment, "stop", {}), "departures", "__typename"),
        stopDeparture: stopDepartures[0],
      };
    });

    return (
      <JourneyStopsWrapper expanded={this.journeyIsExpanded}>
        <JourneyExpandToggle
          expanded={this.journeyIsExpanded}
          onClick={() => this.toggleJourneyExpanded()}>
          {this.journeyIsExpanded ? (
            <HiddenStopsMessage>Hide stops</HiddenStopsMessage>
          ) : (
            <HiddenStopsMessage>
              {journeyStops.length - 2} <Text>journey.stops_hidden</Text>
            </HiddenStopsMessage>
          )}
        </JourneyExpandToggle>
        <StopsList>
          {this.journeyIsExpanded &&
            journeyStops
              .slice(1, journeyStops.length - 1)
              .map((journeyStop) => (
                <JourneyStop
                  key={`journey_stop_${journeyStop.stopId}_${journeyStop.stopIndex}`}
                  stop={journeyStop}
                  originDeparture={originDeparture}
                  date={date}
                  journeyPositions={journeyHfp}
                  onClickTime={onClickTime}
                />
              ))}
        </StopsList>
      </JourneyStopsWrapper>
    );
  }
}

export default JourneyStops;
