import {StoreContext} from "../../stores/StoreContext";
import {Provider} from "mobx-react";
import React from "react";
import {isObservable, observable} from "mobx";

export const MobxProviders = ({children, state = {}, actions = {}}) => {
  const observableState = isObservable(state) ? state : observable(state);

  return (
    <Provider state={observableState} actions={actions}>
      <StoreContext.Provider value={{state: observableState, actions}}>
        {children}
      </StoreContext.Provider>
    </Provider>
  );
};
