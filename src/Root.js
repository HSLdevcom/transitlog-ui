import React, {useMemo} from "react";
import {hot} from "react-hot-loader/root";
import App from "./components/App";
import {getClient} from "./api";
import {ApolloProvider} from "react-apollo";
import {observer} from "mobx-react-lite";
import {GlobalFormStyle} from "./components/Forms";
import {ModalProvider, BaseModalBackground} from "styled-react-modal";
import styled from "styled-components";
import flow from "lodash/flow";
import {Provider} from "mobx-react";
import {store, StoreContext} from "./stores/StoreContext";

const SpecialModalBackground = styled(BaseModalBackground)`
  z-index: 100;
  background: rgba(0, 0, 0, 0.1);
`;

const decorate = flow(observer);

const Root = decorate(() => {
  const client = useMemo(() => getClient(store.UI), []);

  return (
    /* inject() from mobx-react uses the first Provider context */
    <Provider {...store}>
      {/* Our own inject() helper uses this context */}
      <StoreContext.Provider value={store}>
        <ApolloProvider client={client}>
          <ModalProvider backgroundComponent={SpecialModalBackground}>
            <>
              <GlobalFormStyle />
              <App />
            </>
          </ModalProvider>
        </ApolloProvider>
      </StoreContext.Provider>
    </Provider>
  );
});

export default hot(Root);
