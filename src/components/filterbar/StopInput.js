import React, {useMemo, useState, useCallback} from "react";
import SuggestionInput, {
  SuggestionContent,
  SuggestionText,
  SuggestionAlerts,
} from "./SuggestionInput";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";
import styled from "styled-components";
import Loading from "../Loading";
import {applyTooltip} from "../../hooks/useTooltip";
import {parseLineNumber} from "../../helpers/parseLineNumber";
import sortBy from "lodash/sortBy";
import getTransportType from "../../helpers/getTransportType";
import orderBy from "lodash/orderBy";
import {intval} from "../../helpers/isWithinRange";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

const getSuggestionValue = (suggestion) => {
  if (typeof suggestion === "string") {
    return suggestion;
  }

  return get(suggestion, "stopId", "");
};

const renderSuggestion = (date) => (suggestion, {query, isHighlighted}) => {
  const suggestionAlerts = getAlertsInEffect(suggestion.alerts || [], date);

  return (
    <SuggestionContent
      {...applyTooltip(
        (suggestion.routes || [])
          .map(
            ({routeId, direction, isTimingStop}) =>
              `${routeId}/${direction}${isTimingStop ? " 🕒" : ""}`
          )
          .join("\n")
      )}
      isHighlighted={isHighlighted}>
      <SuggestionText>
        <strong>
          {suggestion.stopId} ({suggestion.shortId.replace(/ /g, "")})
        </strong>
        <br />
        {suggestion.name}
      </SuggestionText>
      {suggestionAlerts.length !== 0 && <SuggestionAlerts alerts={suggestionAlerts} />}
    </SuggestionContent>
  );
};

const renderSuggestionsContainer = (loading) => ({containerProps, children, query}) => {
  return (
    <div data-testid="stop-suggestions-list" {...containerProps}>
      {loading ? <LoadingSpinner inline={true} /> : children}
    </div>
  );
};

const getFilteredSuggestions = (stops, {value = ""}) => {
  function prepareMatchVal(val) {
    return val
      .trim()
      .replace(/\s/g, "")
      .toLowerCase();
  }

  const inputValue = prepareMatchVal(value);
  const inputLength = inputValue.length;

  const filteredStops =
    inputLength === 0
      ? stops
      : stops.filter(({stopId, shortId, name}) => {
          const matchStopId = prepareMatchVal(stopId);
          const matchShortId = prepareMatchVal(shortId);
          const matchName = prepareMatchVal(name);

          let matches = 0;

          if (matchShortId.startsWith(inputValue)) {
            matches++;
          }

          if (matchStopId.startsWith(inputValue)) {
            matches++;
          }

          if (matchName.includes(inputValue)) {
            matches++;
          }

          return matches > 0;
        });

  if (inputLength === 0) {
    return sortBy(filteredStops, ({shortId}) => {
      const cityLetter = shortId[0];
      let sortValue = 0;

      if (cityLetter === "E") {
        sortValue = 10000;
      } else if (cityLetter === "V") {
        sortValue = 20000;
      } else if (cityLetter !== "H") {
        sortValue = 30000;
      }

      return intval(shortId.substring(1)) + sortValue;
    });
  }

  return orderBy(
    filteredStops,
    ({stopId, shortId, name}) => {
      let matchScore = 0;

      const cleanStopId = prepareMatchVal(stopId);
      const cleanShortId = prepareMatchVal(shortId);
      const cleanName = prepareMatchVal(name);

      let checkValue = cleanName;
      let charIdx = 0;
      const firstInputChar = inputValue[0];

      if (cleanShortId[0] === firstInputChar) {
        charIdx = 1;
        matchScore = matchScore + 100;
        checkValue = cleanShortId;
      } else if (cleanStopId[0] === firstInputChar) {
        charIdx = 1;
        matchScore = matchScore + 20;
        checkValue = cleanStopId;
      }

      // Loop through the given search term and match it
      // to a stopId or shortId or name, letter by letter.
      for (charIdx; charIdx < inputValue.length; charIdx++) {
        // Get the search char and set the index
        const char = inputValue[charIdx];
        let checkIdx = charIdx;

        // Loop through the checkValue
        for (checkIdx; checkIdx < checkValue.length; checkIdx++) {
          const checkChar = checkValue[charIdx];
          // Reduce the given score by how far into the check value we are from the current index.
          // 0 is a perfect match, more means a mismatch between the char indices.
          const distancePenalty = Math.abs(checkIdx - charIdx);

          if (char === checkChar) {
            // Increase the match score by the length of the search term and reduce by the penalty.
            matchScore = matchScore + (inputValue.length - distancePenalty);
            break; // Go to the next letter if this was a match!
          } else {
            // If no match, reduce the score.
            matchScore = matchScore - charIdx;
          }
        }
      }

      return matchScore;
    },
    "desc"
  );
};

export default observer(({date, stops, onSelect, stop, loading}) => {
  const [options, setOptions] = useState(stops);
  const renderSuggestionFn = useMemo(() => renderSuggestion(date), [date]);

  const onSearch = useCallback(
    (searchQuery) => {
      const result = getFilteredSuggestions(stops, searchQuery);
      setOptions(result);
    },
    [stops]
  );

  return (
    <SuggestionInput
      testId="stop-input"
      helpText="Select stop"
      minimumInput={0}
      value={stop}
      onSelect={onSelect}
      getValue={getSuggestionValue}
      highlightFirstSuggestion={true}
      renderSuggestion={renderSuggestionFn}
      suggestions={options.slice(0, 50)}
      renderSuggestionsContainer={renderSuggestionsContainer(loading)}
      onSuggestionsFetchRequested={onSearch}
    />
  );
});
