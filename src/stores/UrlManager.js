import get from "lodash/get";
import invoke from "lodash/invoke";
import fromPairs from "lodash/fromPairs";
import {createBrowserHistory as createHistory} from "history";
import {AUTH_STATE_STORAGE_KEY} from "../constants";

/**
 * Make sure that all history operations happen through the specific history object
 * created here:
 */

let history = createHistory();

const historyChangeListeners = [];

export const onHistoryChange = (cb) => {
  if (!historyChangeListeners.includes(cb)) {
    historyChangeListeners.push(cb);
  }

  return () => {
    const cbIndex = historyChangeListeners.indexOf(cb);

    if (cbIndex !== -1) {
      historyChangeListeners.splice(cbIndex, 1);
    }
  };
};

history.listen((location) => {
  if (get(location, "state.allowReactions", false)) {
    const urlState = getUrlState();
    historyChangeListeners.forEach((cb) => cb(urlState));
  }
});

// Only for testing
export const __setHistoryForTesting = (historyObj) => {
  history = historyObj;
};

// Sets or changes an URL value. Use replace by default,
// as we don't need to grow the history stack. We're not
// listening to the url anyway, so going back does nothing.
export const setUrlValue = (key, val, historyAction = "replace") => {
  const query = new URLSearchParams(history.location.search);

  if (val === null || typeof val === "undefined") {
    query.delete(key);
  } else if (query.has(key)) {
    query.set(key, val);
  } else {
    query.append(key, val);
  }

  const queryStr = query.toString();

  invoke(history, historyAction, {
    pathname: history.location.pathname,
    search: queryStr,
  });
};

export const getUrlState = () => {
  const query = new URLSearchParams(history.location.search);
  return fromPairs(
    Array.from(query.entries()).map(([key, value]) => {
      let nextVal = value;
      if (value === "true") {
        nextVal = true;
      }

      if (value === "false") {
        nextVal = false;
      }

      if (value === "" || typeof value === "undefined") {
        nextVal = "";
      }

      return [key, nextVal];
    })
  );
};

export const getUrlValue = (key, defaultValue = "") => {
  const values = getUrlState();
  return get(values, key, defaultValue);
};

export const setPathName = (pathName, historyAction = "replace") => {
  invoke(history, historyAction, {
    pathname: pathName,
    search: history.location.search,
  });
};

export const getPathName = () => {
  return history.location.pathname;
};

export const resetUrlState = (replace = false) => {
  if (replace) {
    history.replace({pathname: "/", search: ""});
  } else {
    history.push({pathname: "/", search: ""});
  }
};

const AUTH_URI = process.env.REACT_APP_AUTH_URI;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const SCOPE = process.env.REACT_APP_AUTH_SCOPE;

export const redirectToLogin = (register = false) => {
  // Save the current url state so that we can re-apply it after the login.
  const urlState = window.location.href.replace(window.location.origin, "");

  if (urlState && urlState.length > 1) {
    sessionStorage.setItem(AUTH_STATE_STORAGE_KEY, urlState);
  }

  let authUrl = `${AUTH_URI}?ns=hsl-transitlog&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}&ui_locales=en`;

  if (register) {
    authUrl += "&nur";
  }

  window.location.assign(authUrl);
};

export const removeAuthParams = () => {
  const preAuthState = sessionStorage.getItem(AUTH_STATE_STORAGE_KEY);

  if (preAuthState) {
    // sessionStorage.removeItem(AUTH_STATE_STORAGE_KEY);
    const nextPathname =
      window.location.origin +
      (preAuthState.startsWith("/") ? preAuthState : "/" + preAuthState);

    const url = new URL(nextPathname);
    // Must do a refresh here to apply the state
    history.replace({pathname: url.pathname, search: url.search}, {allowReactions: true});
  } else {
    let shareUrl = window.location.href;
    const url = new URL(shareUrl);
    url.searchParams.delete("code");
    url.searchParams.delete("scope");

    history.replace({pathname: "/", search: url.search});
  }
};
