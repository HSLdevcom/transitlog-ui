import {StoreContext} from "../../stores/StoreContext";
import React from "react";
import {isObservable, observable} from "mobx";

export const MobxProviders = ({children, state = {}, actions = {}}) => {
  const observableState = isObservable(state) ? state : observable(state);

  return (
    <StoreContext.Provider value={{state: observableState, actions}}>
      {children}
    </StoreContext.Provider>
  );
};
