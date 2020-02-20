import React, {useState, useCallback} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import HSLLogoNoText from "../icons/HSLLogoNoText";
import Login from "../icons/Login";
import {applyTooltip} from "../hooks/useTooltip";
import {logout, authorize} from "../auth/authService";
import {redirectToLogin} from "../stores/UrlManager";
import {withApollo} from "@apollo/react-hoc";
import {LoadingDisplay} from "./Loading";
import {text, Text} from "../helpers/text";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";

const Root = styled.div`
  position: fixed;
  z-index: 800;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
`;

const Wrapper = styled.div`
  position: fixed;
  z-index: 900;
  top: 50%;
  left: 50%;
  padding: 30px 90px;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 3px 14px rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  text-align: center;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  color: #fff;
  background-color: #007ac9a6;
`;

const Header = styled.div`
  padding: 10px 0px 10px 0px;
  user-select: none;
`;

const LoadingIndicator = styled(LoadingDisplay)`
  position: static;
`;

const LoginButton = styled.button`
  display: flex;
  flex-basis: 50px;
  justify-content: center;
  flex-direction: row;
  align-items: center;
  user-select: none;
  width: 225px;
  cursor: pointer;
  border-radius: 2px;
  background-color: #ffffffe6;
  color: #3e3e3e;
  padding: 15px;
  font-family: inherit;

  :hover {
    background-color: #FFF;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 3px 14px rgba(0, 0, 0, 0.4);
`;

const LoginText = styled.span`
  margin-left: 10px;
`;

const Title = styled.h2`
  margin: 10px 0px 10px 0px;
`;

const allowDevLogin = process.env.REACT_APP_ALLOW_DEV_LOGIN === "true";

const decorate = flow(observer, withApollo, inject("UI"));

const LoginModal = decorate(({UI, client, state}) => {
  const [loading, setLoading] = useState(false);

  const toggleLoginLoading = useCallback(
    (setTo = !loading) => {
      setLoading(setTo);
    },
    [loading]
  );

  const onModalClick = useCallback((e) => {
    e.stopPropagation();
    if (e.currentTarget.className.includes("Root")) {
      UI.toggleLoginModal();
    }
  });

  const onLogoutClick = useCallback(() => {
    toggleLoginLoading(true);

    logout().then(async (response) => {
      if (response.status === 200) {
        UI.setUser(null);
        await client.resetStore();
      }

      toggleLoginLoading(false);
      UI.toggleLoginModal();
    });
  }, []);

  const openAuthForm = useCallback(
    (type) => () => {
      redirectToLogin(type === "register");
    },
    []
  );

  const onDevLogin = useCallback(async () => {
    toggleLoginLoading(true);

    const response = await authorize("dev");

    if (response && response.isOk && response.email) {
      UI.setUser(response.email);
      await client.resetStore();
    }

    toggleLoginLoading(false);
    UI.toggleLoginModal();
  }, []);

  const {user} = state;

  return (
    <Root onClick={onModalClick}>
      <Wrapper onClick={onModalClick}>
        <Header>
          <HSLLogoNoText fill={"white"} height={"80px"} />
          <Title>HSL {text("filterpanel.heading")}</Title>
        </Header>
        {loading ? (
          <LoadingIndicator loading={true} />
        ) : (
          <>
            {user ? (
              <LoginButton data-testid="logout-button" onClick={onLogoutClick}>
                <Login height={"1em"} fill={"#3e3e3e"} />
                <LoginText>
                  <Text>auth.logout</Text>
                </LoginText>
              </LoginButton>
            ) : (
              <>
                <p>
                  <LoginButton
                    onClick={openAuthForm("login")}
                    {...applyTooltip("Sign in with HSL-ID")}>
                    <Login height={"1em"} fill={"#3e3e3e"} />
                    <LoginText>
                      <Text>auth.login</Text>
                    </LoginText>
                  </LoginButton>
                </p>
                {allowDevLogin && (
                  <p>
                    <LoginButton
                      onClick={onDevLogin}
                      {...applyTooltip("Developer sign in")}>
                      <Login height={"1em"} fill={"#3e3e3e"} />
                      <LoginText>Dev login</LoginText>
                    </LoginButton>
                  </p>
                )}
                <p>
                  <LoginButton
                    onClick={openAuthForm("register")}
                    {...applyTooltip("Create user")}>
                    <Login height={"1em"} fill={"#3e3e3e"} />
                    <LoginText>
                      <Text>auth.create_account</Text>
                    </LoginText>
                  </LoginButton>
                </p>
              </>
            )}
          </>
        )}
      </Wrapper>
    </Root>
  );
});

export default LoginModal;
