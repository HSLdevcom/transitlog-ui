import React, {useMemo} from "react";
import {hot} from "react-hot-loader/root";
import App from "./components/App";
import {getClient} from "./api";
import {ApolloProvider} from "@apollo/react-common";
import {observer} from "mobx-react-lite";
import {GlobalFormStyle} from "./components/Forms";
import {ModalProvider, BaseModalBackground} from "styled-react-modal";
import styled from "styled-components";
import flow from "lodash/flow";
import {inject} from "./helpers/inject";

const SpecialModalBackground = styled(BaseModalBackground)`
  z-index: 100;
  background: rgba(0, 0, 0, 0.1);
`;

const decorate = flow(
  observer,
  inject("UI")
);

const Root = decorate(({UI}) => {
  const client = useMemo(() => getClient(UI), []);

  return (
    <ApolloProvider client={client}>
      <ModalProvider backgroundComponent={SpecialModalBackground}>
        <>
          <GlobalFormStyle />
          <App />
        </>
      </ModalProvider>
    </ApolloProvider>
  );
});

export default hot(Root);
