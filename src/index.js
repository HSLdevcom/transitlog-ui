/* eslint-disable import/first */
import moment from "moment-timezone";
import {TIMEZONE} from "./constants";

// Set the default timezone for the app
moment.tz.setDefault(TIMEZONE);

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Root from "./Root";
import {Provider} from "mobx-react";
import {store, StoreContext} from "./stores/StoreContext";

const root = document.getElementById("root");

(() => {
  ReactDOM.render(
    /* inject() from mobx-react uses the first Provider context */
    <Provider {...store}>
      {/* Our own inject() helper uses this context */}
      <StoreContext.Provider value={store}>
        <Root />
      </StoreContext.Provider>
    </Provider>,
    root
  );
})();
