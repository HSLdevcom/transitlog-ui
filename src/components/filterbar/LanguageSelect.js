import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {Button} from "../Forms";
import styled from "styled-components";
import {LANGUAGES} from "../../stores/UIStore";

const LanguageButtonsWrapper = styled.div`
  display: flex;
`;

const LanguageButton = styled(Button)`
  border-radius: 3px;
  line-height: normal;
  width: 2rem;
  height: 1.75rem;
  background: ${({active}) => (active ? "var(--dark-blue)" : "var(--blue)")};
  margin-right: 0.3125rem;
  padding: 0;
  color: white;
  font-size: 0.8125rem;
  font-weight: 400;
  text-transform: uppercase;

  &:hover {
    background: ${({active}) => (active ? "var(--dark-blue)" : "var(--blue)")};
  }
`;

@inject(app("UI"))
@observer
class LanguageSelect extends Component {
  onSelectLanguage = (which) => (e) => {
    e.preventDefault();

    const {UI} = this.props;
    UI.setLanguage(which);
  };

  render() {
    const {
      className,
      state: {language},
    } = this.props;

    return (
      <LanguageButtonsWrapper className={className}>
        <LanguageButton
          data-testid="select-lang-fi"
          helpText="Language select finnish"
          active={language === LANGUAGES.FINNISH}
          onClick={this.onSelectLanguage(LANGUAGES.FINNISH)}>
          Fi
        </LanguageButton>
        <LanguageButton
          data-testid="select-lang-se"
          helpText="Language select swedish"
          active={language === LANGUAGES.SWEDISH}
          onClick={this.onSelectLanguage(LANGUAGES.SWEDISH)}>
          Se
        </LanguageButton>
        <LanguageButton
          data-testid="select-lang-en"
          helpText="Language select english"
          active={language === LANGUAGES.ENGLISH}
          onClick={this.onSelectLanguage(LANGUAGES.ENGLISH)}>
          En
        </LanguageButton>
      </LanguageButtonsWrapper>
    );
  }
}

export default LanguageSelect;
