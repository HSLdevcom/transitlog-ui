import React, {Component} from "react";
import Autosuggest from "react-autosuggest";
import autosuggestStyles from "./SuggestionInput.css";
import {observer} from "mobx-react";
import styled from "styled-components";
import {InputStyles} from "../Forms";
import {observable, action} from "mobx";
import Tooltip from "../Tooltip";
import get from "lodash/get";

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
    margin-top: 0.15rem;
    content: "";
    width: 1.25rem;
    height: 1.25rem;
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

@observer
class SuggestionInput extends Component {
  static defaultProps = {
    onSuggestionsClearRequested: () => [],
    onSuggestionsFetchRequested: () => {},
    suggestions: [],
  };

  @observable
  inputValue = this.getStringValue(this.props.value);

  setValue = action((value) => {
    this.inputValue = this.getStringValue(value);
  });

  getStringValue = (val) => {
    const {getInputValue = defaultGetInputValue} = this.props;
    return getInputValue(val);
  };

  getValue = (val) => {
    const {getValue = defaultGetInputValue} = this.props;
    return getValue(val);
  };

  onChange = (event, {newValue}) => {
    if (!newValue) {
      this.props.onSelect("");
    }

    this.setValue(newValue);
  };

  onSuggestionSelected = (event, {suggestion}) => {
    const nextValue = this.getValue(suggestion);
    this.props.onSelect(nextValue);
    this.setValue(suggestion);
  };

  shouldRenderSuggestions = (limit) => (value = "") => {
    return typeof value.trim === "function" ? (value || "").trim().length >= limit : true;
  };

  componentDidUpdate({value: prevValue}) {
    const {value} = this.props;

    if (value !== prevValue) {
      this.setValue(value);
    }
  }

  render() {
    const {
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
      ...autosuggestProps
    } = this.props;

    const inputProps = {
      placeholder,
      value: this.inputValue,
      onChange: this.onChange,
      "data-testid": testId,
      onFocus: () => {
        this.setValue(value);
      },
    };

    return (
      <Tooltip helpText={helpText}>
        <AutosuggestWrapper className={className}>
          <Autosuggest
            focusInputOnSuggestionClick={false}
            shouldRenderSuggestions={this.shouldRenderSuggestions(minimumInput)}
            onSuggestionSelected={this.onSuggestionSelected}
            getSuggestionValue={this.getStringValue}
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
}

export default SuggestionInput;
