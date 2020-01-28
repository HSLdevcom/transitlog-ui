import React from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import getJourneyId from "../../helpers/getJourneyId";
import {latLng} from "leaflet";
import {inject} from "../../helpers/inject";

const decorate = flow(observer, inject("UI"));

/**
 * Utility component for centering on the currently selected journey position
 * OR the current Mapillary position. Mapillary has priority.
 *
 * This makes the map follow the vehicle when the time is changed.
 * */

const CenterOnPosition = decorate(({journeyPositions, state, UI}) => {
  const {live, selectedJourney, currentMapillaryMapLocation} = state;
  const selectedJourneyId = getJourneyId(selectedJourney);

  if (live) {
    return null;
  }

  const selectedJourneyPosition =
    journeyPositions.size === 1 && selectedJourneyId
      ? journeyPositions.get(selectedJourneyId) || false
      : false;

  const {lat, lng} = selectedJourneyPosition || {};

  let centerPosition = false;

  if (currentMapillaryMapLocation) {
    centerPosition = currentMapillaryMapLocation;
  } else if (lat && lng && selectedJourney) {
    centerPosition = latLng([lat, lng]);
  }

  if (centerPosition) {
    UI.setMapView(centerPosition);
  }

  return null;
});

export default CenterOnPosition;
