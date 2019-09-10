/* eslint-disable import/first */
import moment from "moment-timezone";
import {TIMEZONE} from "./constants";

// Set the default timezone for the app
moment.tz.setDefault(TIMEZONE);

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import {StoreContext, store} from "./stores/StoreContext";
import {Provider} from "mobx-react";
import Root from "./Root";

const root = document.getElementById("root");

(() => {
  /* inject() from mobx-react uses the first Provider context */
  ReactDOM.render(
    <Provider {...store}>
      {/* Our own inject() helper uses this context */}
      <StoreContext.Provider value={store}>
        <Root />
      </StoreContext.Provider>
    </Provider>,
    root
  );
})();
