import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import "./Map.css";
import VehicleMarker from "./VehicleMarker";
import DivIcon from "./DivIcon";
import HfpTooltip from "./HfpTooltip";
import get from "lodash/get";
import flow from "lodash/flow";
import getJourneyId from "../../helpers/getJourneyId";
import {useToggle} from "../../hooks/useToggle";
import {inject} from "../../helpers/inject";

const decorate = flow(observer, inject("Journey"));

const HfpMarkerLayer = decorate(
  ({
    journey,
    Journey,
    currentEvent: event,
    isSelectedJourney = false,
    state: {selectedJourney},
    markerRef = null,
  }) => {
    const [tooltipOpen, toggleTooltip] = useToggle(false);

    const onMarkerClick = useCallback(() => {
      toggleTooltip();

      if (journey && getJourneyId(selectedJourney) !== journey.id) {
        Journey.setSelectedJourney(journey);
      }
    }, [journey, selectedJourney]);

    if (
      !journey ||
      !event ||
      !(event.lat && event.lng) ||
      (event.type && (event.type === "TLR" || event.type === "TLA"))
    ) {
      return null;
    }

    return (
      <DivIcon
        ref={markerRef}
        onClick={onMarkerClick}
        position={[event.lat, event.lng]}
        iconSize={isSelectedJourney ? [30, 30] : [20, 20]}
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
          key={`permanent=${tooltipOpen}`}
          journey={journey}
          event={event}
          permanent={tooltipOpen}
          sticky={false}
        />
      </DivIcon>
    );
  }
);

export default HfpMarkerLayer;
