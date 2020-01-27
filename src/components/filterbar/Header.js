import React from "react";
import logo from "../../hsl-logo.png";
import {Text, text} from "../../helpers/text";
import styled from "styled-components";
import {Heading} from "../Typography";
import LanguageSelect from "./LanguageSelect";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import Login from "../../icons/Login";
import ControlBar from "./ControlBar";
import {Button} from "../Forms";
import Info from "../../icons/Info";
import {ENV_NAME} from "../../constants";

const Header = styled.header`
  width: 100%;
  background: var(--blue);
  padding: 0.5rem 0.875rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

const Logo = styled.img`
  width: 4.5rem;
  height: auto;
  flex: 0 0 auto;
`;

const MainHeading = styled(Heading).attrs({level: 1})`
  color: white;
  margin: 0 0 0 1rem;
  font-size: 1.25rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
`;

const LogoAndHeading = styled.div`
  display: flex;
  flex: 0;
  align-items: center;
  justify-content: flex-start;
`;

const LangSelectContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: flex-start;
  margin-right: 2rem;

  div {
    flex: 0 0 auto;
    margin-right: 1rem;
  }
`;

const HeaderFeatures = styled(ControlBar)`
  align-items: center;
  flex: 1 1 auto;
  margin: 0 2rem;
`;

const LoginContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  margin-left: auto;
`;

const Username = styled.div`
  color: white;
  margin-right: 0.75rem;
`;

const IconButton = styled(Button).attrs({small: true, transparent: true})`
  font-size: 0.75rem;
  padding: 0.2rem 0.75rem;
  border: 0;
  margin-left: 0.75rem;

  &:last-child {
    margin-right: 0;
  }
`;

const EnvName = styled.span`
  color: var(--dark-blue);
  padding: 3px 5px;
  margin-right: 0.5rem;
  border-radius: 5px;
  background: white;
  font-size: 1rem;
`;

const decorate = flow(observer, inject("UI"));

function HeaderComponent({state, UI, className}) {
  const {user} = state;
  return (
    <Header className={className}>
      <LogoAndHeading>
        <Logo src={logo} alt="logo" />
        <MainHeading>
          {ENV_NAME && <EnvName>{ENV_NAME}</EnvName>}
          <Text>filterpanel.heading</Text>
        </MainHeading>
      </LogoAndHeading>
      <HeaderFeatures />
      <LangSelectContainer>
        <LanguageSelect />
      </LangSelectContainer>
      <LoginContainer>
        {user && <Username data-testid="authenticated-user">{user}</Username>}
        <IconButton
          data-testid="auth-modal-button"
          onClick={() => UI.toggleLoginModal()}
          helpText={text("Sign in")}>
          <Login height="1.2rem" fill="white" />
        </IconButton>
        <IconButton
          onClick={() => UI.toggleInstructions()}
          helpText={text("Show info")}
          data-testid="open-instructions">
          <Info fill="white" width="1.2rem" height="1.2rem" />
        </IconButton>
      </LoginContainer>
    </Header>
  );
}

export default decorate(HeaderComponent);
