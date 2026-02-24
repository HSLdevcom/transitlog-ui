const runtime = window.__CONFIG__ ?? {};

const env = (key) => runtime[key] ?? process.env[key];

export const SERVER_URL = env("REACT_APP_TRANSITLOG_SERVER");
export const GRAPHQL_URL = env("REACT_APP_TRANSITLOG_SERVER_GRAPHQL");
export const AUTH_URI = env("REACT_APP_AUTH_URI");
export const REDIRECT_URI = env("REACT_APP_REDIRECT_URI");
export const CLIENT_ID = env("REACT_APP_CLIENT_ID");
export const AUTH_SCOPE = env("REACT_APP_AUTH_SCOPE");
export const PRODUCTION_URL = env("REACT_APP_PRODUCTION_URL");
export const ALLOW_DEV_LOGIN = env("REACT_APP_ALLOW_DEV_LOGIN") === "true";

export const FMI_APIKEY = env("REACT_APP_FMI_APIKEY");
export const DIGITRANSIT_URL = env("REACT_APP_DIGITRANSIT_URL");
export const MAPILLARY_CLIENT_TOKEN = env("REACT_APP_MAPILLARY_CLIENT_TOKEN");
export const DIGITRANSIT_API_KEY = env("REACT_APP_DIGITRANSIT_API_KEY");

export const TIMEZONE = process.env.REACT_APP_TIMEZONE || "Etc/UTC";
export const MAX_JORE_YEAR = "2050";
export const AUTH_STATE_STORAGE_KEY = "pre_auth_state";
export const TIME_SLIDER_MAX = 102600; // 28:30:00
export const TIME_SLIDER_MIN = 0; // 00:00:00
export const TIME_SLIDER_DEFAULT_MIN = 16200; // 04:30
export const STOP_EVENTS = ["DEP", "PDE", "PAS", "ARR", "ARS", "DUE", "WAIT"];
export const ENV_NAME = process.env.REACT_APP_ENV_NAME || "";

// Faux-enum for validating sidepanel tab changes
export const SidePanelTabs = {
  AreaJourneys: "area-journeys",
  AreaSpeeds: "area-speeds",
  Journeys: "journeys",
  WeekJourneys: "week-journeys",
  VehicleJourneys: "vehicle-journeys",
  Timetables: "timetables",
  Alerts: "alerts",
};
