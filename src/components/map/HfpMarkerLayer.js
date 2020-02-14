import React, {forwardRef, useCallback} from "react";
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
  forwardRef(
    (
      {
        journey,
        Journey,
        currentEvent: event,
        isSelectedJourney = false,
        state: {selectedJourney},
      },
      ref
    ) => {
      const [tooltipOpen, toggleTooltip] = useToggle(false);

      const onMarkerClick = useCallback(() => {
        toggleTooltip();

        if (journey && getJourneyId(selectedJourney) !== journey.id) {
          Journey.setSelectedJourney(journey);
        }
      }, [journey, selectedJourney]);

      if (!journey || !event || !(event.lat && event.lng)) {
        return null;
      }

      return (
        <DivIcon
          ref={ref}
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
  )
);

export default HfpMarkerLayer;
