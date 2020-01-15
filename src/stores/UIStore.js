import {extendObservable, observable, reaction, set} from "mobx";
import {getUrlValue, onHistoryChange} from "./UrlManager";
import uiActions from "./uiActions";
import get from "lodash/get";
import trim from "lodash/trim";
import {boundsFromBBoxString} from "../helpers/boundsFromBBoxString";
import {latLng} from "leaflet";
import {intval} from "../helpers/isWithinRange";

export const LANGUAGES = {
  FINNISH: "fi",
  ENGLISH: "en",
  SWEDISH: "se",
};

// Language state is external because there are some parts of the app
// that use it that are outside the scope of the React tree.
export const languageState = observable({
  language: getUrlValue("language", "fi"),
});

export const areaEventsStyles = {
  MARKERS: "markers",
  POLYLINES: "polylines",
};

export const weeklyObservedTimeTypes = {
  LAST_STOP_ARRIVAL: "arrival",
  FIRST_STOP_DEPARTURE: "departure",
};

export default (state) => {
  const urlCenter = getUrlValue("mapView");
  const urlZoom = getUrlValue("mapZoom");

  let [lat = "", lng = ""] = urlCenter.split(",");

  // Use default coordinates if parsing or validation fails.
  if (!lat || !trim(lat) || !parseInt(lat)) {
    lat = 60.170988;
  }
  if (!lng || !trim(lng) || !parseInt(lng)) {
    lng = 24.940842;
  }

  const urlBounds = getUrlValue("selectedBounds", null);

  extendObservable(
    state,
    {
      sidePanelVisible: getUrlValue("sidePanelVisible", true),
      journeyDetailsOpen: getUrlValue("journeysDetailsOpen", true),
      journeyGraphOpen: getUrlValue("journeyGraphOpen", false),
      showInstructions: getUrlValue("showInstructions", false),
      mapOverlays: getUrlValue("mapOverlays", "Stopped vehicle").split(","),
      areaEventsStyle: getUrlValue("areaEventsStyle", areaEventsStyles.MARKERS),
      areaEventsRouteFilter: getUrlValue("areaEventsRouteFilter", ""),
      selectedBounds: urlBounds ? boundsFromBBoxString(urlBounds) : null,
      weeklyObservedTimes: getUrlValue(
        "weeklyObservedTimes",
        weeklyObservedTimeTypes.FIRST_STOP_DEPARTURE
      ),
      highlightedStop: "",
      language: languageState.language,
      errors: [],
      shareModalOpen: false,
      user: null,
      currentMapillaryViewerLocation: null,
      currentMapillaryMapLocation: null,
      mapView: latLng([lat, lng]),
      mapZoom: intval(urlZoom) || 13,
      mapBounds: null,
      mapDriverEvent: null,
    },
    {
      selectedBounds: observable.ref,
      currentMapillaryViewerLocation: observable.ref,
      currentMapillaryMapLocation: observable.ref,
      mapView: observable.ref,
      mapBounds: observable.ref,
    }
  );

  const actions = uiActions(state);

  // Sync external languageState with app state.
  reaction(
    () => languageState.language,
    (currentLanguage) => {
      state.language = currentLanguage;
    }
  );

  // Hydrate new state from url on history change
  onHistoryChange((urlState) => {
    set(state, {
      sidePanelVisible: get(urlState, "sidePanelVisible", state.sidePanelVisible),
      journeyDetailsOpen: get(urlState, "journeysDetailsOpen", state.journeyDetailsOpen),
      journeyGraphOpen: get(urlState, "journeyGraphOpen", state.journeyGraphOpen),
      mapOverlays: get(urlState, "mapOverlays", state.mapOverlays.join(",")).split(","),
      areaEventsStyle: get(urlState, "areaEventsStyle", state.areaEventsStyle),
      weeklyObservedTimes: get(
        urlState,
        "weeklyObservedTimes",
        state.weeklyObservedTimes
      ),
    });
  });

  return actions;
};
