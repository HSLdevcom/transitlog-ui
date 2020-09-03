import "mobx-react-lite/batchingForReactDom";
/* eslint-disable import/first */
import moment from "moment-timezone";
import {TIMEZONE} from "./constants";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Root from "./Root";
import {store, StoreContext} from "./stores/StoreContext";

// Set the default timezone for the app
moment.tz.setDefault(TIMEZONE);

const root = document.getElementById("root");

(() => {
  ReactDOM.render(
    <StoreContext.Provider value={store}>
      <Root />
    </StoreContext.Provider>,
    root
  );
})();
