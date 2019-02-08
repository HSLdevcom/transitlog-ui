import React from "react";
import logo from "../../hsl-logo.png";
import {Text} from "../../helpers/text";
import styled from "styled-components";
import {Heading} from "../Typography";
import LanguageSelect from "./LanguageSelect";
import {observer, inject} from "mobx-react";
import {Button} from "../Forms";
import {app} from "mobx-app";
import flow from "lodash/flow";

const Header = styled.header`
  width: 100%;
  background: var(--blue);
  padding: 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
`;

const Logo = styled.img`
  width: 8rem;
  flex: 0 0 auto;
`;

const MainHeading = styled(Heading).attrs({level: 1})`
  color: white;
  flex: 1 1 auto;
  margin: 0.5rem 1.25rem 0 1rem;
  text-align: right;
  font-size: 1.75rem;
  justify-content: flex-end;
`;

const LangSelectContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  margin-left: auto;

  div {
    flex: 0 0 auto;
    margin-right: 1rem;
  }
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-top: 1.5rem;
  flex: 1 0 100%;
`;

const decorate = flow(
  observer,
  inject(app("UI"))
);

export default decorate(({UI, className}) => (
  <Header className={className}>
    <Logo src={logo} alt="logo" />
    <MainHeading>
      <Text>filterpanel.heading</Text>
    </MainHeading>
    <BottomRow>
      <Button small transparent onClick={() => UI.toggleShareModal(true)}>
        <Text>general.share</Text>
      </Button>
      <LangSelectContainer>
        <LanguageSelect />
      </LangSelectContainer>
    </BottomRow>
  </Header>
));
