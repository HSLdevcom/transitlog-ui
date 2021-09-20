import React, {useState, useCallback, useMemo} from "react";
import SuggestionInput, {SuggestionContent, SuggestionText} from "./SuggestionInput";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import Loading from "../Loading";
import debounce from "lodash/debounce";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

const renderSectionTitle = (section) => {
  return "";
};

const getSectionSuggestions = (section) => section.options;

const getSuggestionItem = (suggestion) => {
  return suggestion;
};

const getSuggestionInputValue = (suggestion) => {
  if (typeof suggestion === "string") {
    return suggestion;
  }

  return get(suggestion, "id", "");
};

const renderSuggestion = (suggestion, {isHighlighted}) => {
  const suggestionType = "terminal";

  return (
    <SuggestionContent
      data-testid={`${suggestionType}-option-${suggestion.id}`}
      isHighlighted={isHighlighted}>
      <SuggestionText>
        <strong>{suggestion.id}</strong>
        <br />
        {suggestion.name}
      </SuggestionText>
    </SuggestionContent>
  );
};

const renderSuggestionsContainer = (loading) => ({containerProps, children}) => {
  return (
    <div data-testid="stop-suggestions-list" {...containerProps}>
      {loading ? <LoadingSpinner inline={true} /> : children}
    </div>
  );
};

const getFilteredSuggestions = async (allOptions, {value = ""}) => {
  const searchInput = value;

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?accept-language=fi&namedetails=1&countrycodes=fi&addressdetails=1&viewbox=24.565027%2C60.112033%2C25.182923%2C60.371103&bounded=1&street=${searchInput}&format=json`
  );
  const results = await response.json();
  const filteredResults = {};
  results.forEach((result) => {
    const resultData = result;
    const id = resultData.namedetails.name || resultData.address.road;
    const name = `${resultData.address.road ? `${resultData.address.road}` : ""}${
      resultData.address.house_number ? ` ${resultData.address.house_number}` : ""
    }${resultData.address.suburb ? `, ${resultData.address.suburb}` : ""}${
      resultData.address.city ? `, ${resultData.address.city}` : ""
    }`;

    if (!filteredResults[name]) {
      filteredResults[name] = {
        options: [
          {
            id: `${id}`,
            name: name,
            lat: resultData.lat,
            lon: resultData.lon,
          },
        ],
      };
    }
  });
  return Object.values(filteredResults);
};

export default observer(({location, onSelect, loading}) => {
  const allOptions = useMemo(() => []);
  const [options, setOptions] = useState(allOptions);

  const onSearch = useCallback(async (searchQuery) => {
    const result = await getFilteredSuggestions(allOptions, searchQuery);
    setOptions(result);
  }, []);
  const throttledOnSearch = debounce(onSearch, 1000);
  return (
    <SuggestionInput
      testId="stop-input"
      helpText="Select location"
      minimumInput={0}
      value={location}
      onSelect={onSelect}
      getValue={getSuggestionItem}
      getInputValue={getSuggestionInputValue}
      highlightFirstSuggestion={true}
      multiSection={true}
      renderSectionTitle={renderSectionTitle}
      getSectionSuggestions={getSectionSuggestions}
      renderSuggestion={renderSuggestion}
      suggestions={options}
      renderSuggestionsContainer={renderSuggestionsContainer(loading)}
      onSuggestionsFetchRequested={throttledOnSearch}
    />
  );
});
