import React from "react";
import {getUrlState} from "./UrlManager";
import {createStore} from "mobx-app";
import FilterStore from "./FilterStore";
import TimeStore from "./TimeStore";
import UIStore from "./UIStore";
import JourneyStore from "./JourneyStore";
import FeedbackStore from "./FeedbackStore";
import UpdateManager from "./UpdateManager";

const initialState = getUrlState();

export const store = createStore(
  {
    Filters: FilterStore,
    Time: TimeStore,
    UI: UIStore,
    Journey: JourneyStore,
    Update: UpdateManager,
    Feedback: FeedbackStore,
  },
  initialState
);

export const StoreContext = React.createContext(store);
