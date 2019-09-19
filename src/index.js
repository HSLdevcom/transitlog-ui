/* eslint-disable import/first */
import moment from "moment-timezone";
import {TIMEZONE} from "./constants";

// Set the default timezone for the app
moment.tz.setDefault(TIMEZONE);

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Root from "./Root";

const root = document.getElementById("root");

(() => {
  ReactDOM.render(<Root />, root);
})();
