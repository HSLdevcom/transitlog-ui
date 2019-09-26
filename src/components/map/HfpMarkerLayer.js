import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import "./Map.css";
import VehicleMarker from "./VehicleMarker";
import DivIcon from "./DivIcon";
import HfpTooltip from "./HfpTooltip";
import {observable, action} from "mobx";
import {app} from "mobx-app";
import get from "lodash/get";
import getJourneyId from "../../helpers/getJourneyId";

@inject(app("Journey"))
@observer
class HfpMarkerLayer extends Component {
  markerRef = React.createRef();

  @observable
  tooltipOpen = false;

  toggleTooltip = action((setTo = !this.tooltipOpen) => {
    this.tooltipOpen = setTo;
  });

  onMarkerClick = () => {
    this.toggleTooltip();
    const {Journey, state, journey} = this.props;

    if (journey && getJourneyId(state.selectedJourney) !== journey.id) {
      Journey.setSelectedJourney(journey);
    }
  };

  render() {
    const {journey, currentEvent: event, isSelectedJourney = false} = this.props;

    if (!journey || !event || !(event.lat && event.lng)) {
      return null;
    }

    return (
      <DivIcon
        ref={this.markerRef} // Needs ref for testing
        onClick={this.onMarkerClick}
        position={[event.lat, event.lng]}
        iconSize={isSelectedJourney ? [36, 36] : [20, 20]}
        icon={
          <VehicleMarker
            mode={journey.mode}
            isUnsigned={get(journey, "journeyType", "journey") !== "journey"}
            isSelectedJourney={isSelectedJourney}
            event={event}
          />
        }
        pane={isSelectedJourney ? "hfp-markers-primary" : "hfp-markers"}>
        <HfpTooltip
          key={`permanent=${this.tooltipOpen}`}
          journey={journey}
          event={event}
          permanent={this.tooltipOpen}
          sticky={false}
        />
      </DivIcon>
    );
  }
}

export default HfpMarkerLayer;
