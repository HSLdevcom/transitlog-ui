import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import flow from "lodash/flow";
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

const decorate = flow(observer, inject("UI"));

const LanguageSelect = decorate(({className, UI, state: {language}}) => {
  const onSelectLanguage = useCallback(
    (which) => (e) => {
      e.preventDefault();
      UI.setLanguage(which);
    },
    [UI]
  );

  return (
    <LanguageButtonsWrapper className={className}>
      <LanguageButton
        data-testid="select-lang-fi"
        helpText="Language select finnish"
        active={language === LANGUAGES.FINNISH}
        onClick={onSelectLanguage(LANGUAGES.FINNISH)}>
        Fi
      </LanguageButton>
      <LanguageButton
        data-testid="select-lang-se"
        helpText="Language select swedish"
        active={language === LANGUAGES.SWEDISH}
        onClick={onSelectLanguage(LANGUAGES.SWEDISH)}>
        Se
      </LanguageButton>
      <LanguageButton
        data-testid="select-lang-en"
        helpText="Language select english"
        active={language === LANGUAGES.ENGLISH}
        onClick={onSelectLanguage(LANGUAGES.ENGLISH)}>
        En
      </LanguageButton>
    </LanguageButtonsWrapper>
  );
});

export default LanguageSelect;
