import React, {useCallback, useState, useEffect} from "react";
import Autosuggest from "react-autosuggest";
import autosuggestStyles from "./SuggestionInput.css";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import {InputStyles} from "../Forms";
import Tooltip from "../Tooltip";
import get from "lodash/get";
import flow from "lodash/flow";

const AutosuggestWrapper = styled.div`
  width: 100%;
  ${autosuggestStyles};

  .react-autosuggest__input {
    ${InputStyles};
  }
`;

export const SuggestionContent = styled.div`
  display: flex;
  align-items: center;
  background: ${({isHighlighted = false}) =>
      isHighlighted ? "var(--light-blue)" : "transparent"}
    no-repeat;
  color: ${({isHighlighted = false}) => (isHighlighted ? "white" : "var(--dark-grey)")};
  padding: 0.25rem 0.5rem;
  position: relative;
  width: 100%;

  ${({withIcon = false}) =>
    withIcon
      ? `
&:before {
    margin-top: -0.5rem;
    content: "";
    width: 1.5rem;
    height: 1.5rem;
  }
`
      : ""};
`;

export const SuggestionText = styled.div`
  font-family: var(--font-family);
  line-height: 1.3;
  margin-left: ${({withIcon = false}) => (withIcon ? "0.5rem" : "0")};
`;

export const SelectedOptionDisplay = styled(SuggestionContent)`
  font-size: 0.875rem;
  padding-left: 0;
  align-items: center;
`;

export const SuggestionSectionTitle = styled.div`
  font-weight: bold;
  margin: 0.5rem 0;
  padding: 0.25rem;
`;

function defaultGetInputValue(item) {
  if (typeof item === "string") {
    return item;
  }

  return get(item, "id", "");
}

const decorate = flow(observer);

const SuggestionInput = decorate(
  ({
    className,
    placeholder,
    renderSuggestion,
    minimumInput = 3,
    multiSection,
    renderSectionTitle,
    getSectionSuggestions,
    helpText = "",
    value,
    testId,
    onSelect,
    getInputValue = defaultGetInputValue(),
    getValue = defaultGetInputValue(),
    suggestions = [],
    onSuggestionsClearRequested = () => [],
    onSuggestionsFetchRequested = () => {},
    ...autosuggestProps
  }) => {
    const [inputValue, setInputValue] = useState(getInputValue(value));

    const setValue = useCallback(
      (value) => {
        setInputValue(getInputValue(value));
      },
      [getInputValue]
    );

    const onChange = useCallback(
      (event, {newValue}) => {
        if (!newValue) {
          onSelect("");
        }

        setValue(newValue);
      },
      [onSelect, setValue]
    );

    const onSuggestionSelected = useCallback(
      (event, {suggestion}) => {
        const nextValue = getValue(suggestion);
        onSelect(nextValue);
        setValue(suggestion);
      },
      [getValue, onSelect, setValue]
    );

    const shouldRenderSuggestions = useCallback(
      (limit) => (value = "") => {
        return typeof value.trim === "function"
          ? (value || "").trim().length >= limit
          : true;
      },
      []
    );

    useEffect(() => {
      setValue(value);
    }, [value]);

    const inputProps = {
      placeholder,
      value: inputValue,
      onChange,
      "data-testid": testId,
      onFocus: () => {
        setValue(value);
      },
    };

    return (
      <Tooltip helpText={helpText}>
        <AutosuggestWrapper className={className}>
          <Autosuggest
            focusInputOnSuggestionClick={false}
            shouldRenderSuggestions={shouldRenderSuggestions(minimumInput)}
            onSuggestionSelected={onSuggestionSelected}
            getSuggestionValue={getInputValue}
            highlightFirstSuggestion={true}
            multiSection={multiSection}
            renderSectionTitle={renderSectionTitle}
            getSectionSuggestions={getSectionSuggestions}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            {...autosuggestProps}
          />
        </AutosuggestWrapper>
      </Tooltip>
    );
  }
);

export default SuggestionInput;
