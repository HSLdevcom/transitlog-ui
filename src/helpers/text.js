import {observer} from "mobx-react";
import {languageState} from "../stores/UIStore";
import {get} from "lodash";

const uiFiles = {
  fi: require("../languages/ui/fi.json"),
  se: require("../languages/ui/se.json"),
  en: require("../languages/ui/en.json"),
};

const helpFiles = {
  fi: require("../languages/help/fi.json"),
  se: require("../languages/help/se.json"),
  en: require("../languages/help/en.json"),
};

const alertFiles = {
  fi: require("../languages/alerts/fi.json"),
  se: require("../languages/alerts/fi.json"),
  en: require("../languages/alerts/en.json"),
};

function getTextForToken(token, files, language = languageState.language) {
  const languageFile = get(files, language, false);

  if (!languageFile) {
    console.error("No language file found for language: " + language);
  }

  const languageStr = languageFile[token];

  if (!languageStr) {
    return token;
  }

  return languageStr;
}

export function alertText(text, language) {
  return getTextForToken(text, alertFiles, language);
}

export function helpText(text, language) {
  return getTextForToken(text, helpFiles, language);
}

export function text(token, language) {
  return getTextForToken(token, uiFiles, language);
}

export const Text = observer(({children, text: textToken = children}) => {
  const selectedLanguage = languageState.language;
  return text(textToken, selectedLanguage);
});
