import {action} from "mobx";
import {setUrlValue} from "./UrlManager";
import {
  LANGUAGES,
  languageState,
  areaEventsStyles,
  weeklyObservedTimeTypes,
} from "./UIStore";
import {latLng, LatLng, LatLngBounds} from "leaflet";
import {intval} from "../helpers/isWithinRange";
import {validBounds} from "../helpers/validBounds";
import uniq from "lodash/uniq";
import {SidePanelTabs} from "../constants";

export default (state) => {
  const setMapZoom = action((value) => {
    const nextZoom = intval(value) || 13;

    if (nextZoom !== state.mapZoom) {
      state.mapZoom = nextZoom;
    }
  });

  const setMapView = action((location) => {
    let center = null;

    if (
      !!location &&
      typeof location.toBBoxString === "function" &&
      validBounds(location)
    ) {
      center = location;
    } else if (!!location) {
      center = latLng(location);
    }

    let equals = false;

    if (
      (state.mapView instanceof LatLngBounds && center instanceof LatLngBounds) ||
      (state.mapView instanceof LatLng && center instanceof LatLng)
    ) {
      equals = state.mapView.equals(center);
    }

    if (center && (!state.mapView || !equals)) {
      state.mapView = center;
    }
  });

  const setMapBounds = action((bounds) => {
    if (
      !!bounds &&
      typeof bounds.toBBoxString === "function" &&
      typeof bounds.isValid === "function" &&
      bounds.isValid()
    ) {
      state.mapBounds = bounds;
    } else if (!bounds) {
      state.mapBounds = null;
    }
  });

  const setMapDriverEvent = action((driverEvent = null) => {
    state.mapDriverEvent = driverEvent;
  });

  const setLocationMarker = action((latlng) => {
    state.locationMarker = latlng;
  });

  const toggleShareModal = action((setTo = !state.shareModalOpen) => {
    state.shareModalOpen = setTo;
  });

  const toggleFeedbackModal = action((setTo = !state.feedbackModalOpen) => {
    state.feedbackModalOpen = setTo;
  });

  const setSidePanelTab = action((nextTab) => {
    // Validate that this is actually a tab
    if (Object.values(SidePanelTabs).includes(nextTab)) {
      state.sidePanelTab = nextTab;
      setUrlValue("tab", nextTab);
    } else {
      console.warn(`Non-existent tab ${nextTab} selected! You need to fix this.`);
    }
  });

  const toggleSidePanel = action((setTo = !state.sidePanelVisible) => {
    state.sidePanelVisible = !!setTo;
    setUrlValue("sidePanelVisible", state.sidePanelVisible);
  });

  const toggleJourneyDetails = action((setTo = !state.journeyDetailsOpen) => {
    state.journeyDetailsOpen = !!setTo;
    setUrlValue("journeyDetailsOpen", state.journeyDetailsOpen);
  });

  const toggleJourneyGraph = action((setTo = !state.journeyGraphOpen) => {
    state.journeyGraphOpen = !!setTo;
    setUrlValue("journeyGraphOpen", state.journeyGraphOpen);
  });

  const toggleInstructions = action((setTo = !state.showInstructions) => {
    state.showInstructions = !!setTo;
    setUrlValue("showInstructions", state.showInstructions);
  });

  const setLanguage = action((language) => {
    if (Object.values(LANGUAGES).includes(language)) {
      languageState.language = language;
      setUrlValue("language", languageState.language);
    }
  });

  const setAreaEventsStyle = action((style = areaEventsStyles.MARKERS) => {
    if (Object.values(areaEventsStyles).indexOf(style) !== -1) {
      state.areaEventsStyle = style;
      setUrlValue("areaEventsStyle", state.areaEventsStyle);
    }
  });

  const setAreaEventsRouteFilter = action((value = "") => {
    state.areaEventsRouteFilter = value;
    setUrlValue("areaEventsRouteFilter", state.areaEventsRouteFilter);
  });

  const toggleLoginModal = action((setTo = !state.loginModalOpen) => {
    state.loginModalOpen = !!setTo;
  });

  const setUser = action("Set user", (user) => {
    state.user = user;
  });

  const setWeeklyObservedTimesType = action(
    (type = weeklyObservedTimeTypes.FIRST_STOP_DEPARTURE) => {
      if (Object.values(weeklyObservedTimeTypes).indexOf(type) !== -1) {
        state.weeklyObservedTimes = type;
        setUrlValue("weeklyObservedTimes", state.weeklyObservedTimes);
      }
    }
  );

  const addError = (type, message, target) => {
    if (
      !type ||
      !message ||
      state.errors.some((err) => err.type === type && err.message === message)
    ) {
      return;
    }

    const error = {
      type,
      message,
      target,
      id: `${type}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };

    state.errors.push(error);
  };

  const removeError = (errorCode) => {
    const errorIdx = state.errors.findIndex((err) => err.id === errorCode);

    if (errorIdx !== -1) {
      state.errors.splice(errorIdx, 1);
    }
  };

  const highlightStop = action((stopId) => {
    state.highlightedStop = stopId;
  });

  const setSelectedBounds = action((bounds) => {
    state.selectedBounds =
      !bounds || (typeof bounds.isValid === "function" && !bounds.isValid)
        ? null
        : bounds;

    if (state.selectedBounds) {
      setUrlValue("selectedBounds", state.selectedBounds.toBBoxString());
    } else {
      setUrlValue("selectedBounds", null);
    }
  });

  const setMapillaryViewerLocation = action((location) => {
    state.currentMapillaryViewerLocation = location;
  });

  const setMapillaryMapLocation = action(({latLon: {lat, lon}}) => {
    const location = latLng({lat, lng: lon});
    state.currentMapillaryMapLocation = location;
  });

  const changeOverlay = (changeAction) =>
    action(({name}) => {
      const overlays = [...state.mapOverlays];

      if (changeAction === "remove") {
        // Be sure to hide the Mapillary viewer if the mapillary layer was turned off.
        if (name === "Mapillary") {
          setMapillaryViewerLocation(false);
        }

        const idx = overlays.indexOf(name);

        if (idx !== -1) {
          overlays.splice(idx, 1);
        }
      } else if (changeAction === "add") {
        overlays.push(name);
      }

      const uniqueNames = uniq(overlays);

      setUrlValue(
        "mapOverlays",
        uniqueNames.length !== 0 ? uniqueNames.filter((name) => !!name).join(",") : null
      );

      state.mapOverlays.replace(uniqueNames);
    });

  const allowObjectCentering = action((setTo = true) => {
    state.objectCenteringAllowed = setTo;
  });

  const toggleRouteJourneysLoading = action((setTo = true) => {
    state.routeJourneysLoading = setTo;
  });

  const toggleUnsignedEventsLoading = action((setTo = true) => {
    state.unsignedEventsLoading = setTo;
  });

  return {
    toggleSidePanel,
    setSidePanelTab,
    toggleJourneyDetails,
    toggleJourneyGraph,
    toggleLoginModal,
    toggleInstructions,
    setLanguage,
    changeOverlay,
    addError,
    removeError,
    setAreaEventsStyle,
    setAreaEventsRouteFilter,
    toggleShareModal,
    toggleFeedbackModal,
    highlightStop,
    setUser,
    setWeeklyObservedTimesType,
    setSelectedBounds,
    setMapillaryViewerLocation,
    setMapillaryMapLocation,
    setMapZoom,
    setMapView,
    setMapBounds,
    setMapDriverEvent,
    setLocationMarker,
    allowObjectCentering,
    toggleRouteJourneysLoading,
    toggleUnsignedEventsLoading,
  };
};
