import {action} from "mobx";
import {setUrlValue} from "./UrlManager";
import {
  LANGUAGES,
  languageState,
  areaEventsStyles,
  weeklyObservedTimeTypes,
} from "./UIStore";

export default (state) => {
  const toggleShareModal = action((setTo = !state.shareModalOpen) => {
    state.shareModalOpen = setTo;
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

  const changeOverlay = (changeAction) =>
    action(({name}) => {
      const overlays = state.mapOverlays;

      if (changeAction === "remove") {
        /* TODO: fix this
        // Be sure to hide the Mapillary viewer if the mapillary layer was turned off.
        if( name === "Mapillary" ) {
          this.props.setMapillaryViewerLocation(false);
        }*/

        const idx = overlays.indexOf(name);

        if (idx !== -1) {
          overlays.splice(idx, 1);
        }
      } else if (changeAction === "add") {
        overlays.push(name);
      }

      setUrlValue(
        "mapOverlays",
        overlays.length !== 0 ? overlays.filter((name) => !!name).join(",") : null
      );

      state.mapOverlays.replace(overlays);
    });

  const highlightStop = action((stopId) => {
    state.highlightedStop = stopId;
  });

  const onSelectArea = action((bounds) => {
    state.areaEventsBounds =
      !bounds || (typeof bounds.isValid === "function" && !bounds.isValid)
        ? null
        : bounds;

    if (state.areaEventsBounds) {
      setUrlValue("areaBounds", state.areaEventsBounds.toBBoxString());
    } else {
      setUrlValue("areaBounds", null);
    }
  });

  return {
    toggleSidePanel,
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
    highlightStop,
    setUser,
    setWeeklyObservedTimesType,
    onSelectArea,
  };
};
