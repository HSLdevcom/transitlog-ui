import React, {useState, useCallback, useMemo} from "react";
import SuggestionInput, {
  SuggestionContent,
  SuggestionText,
  SuggestionSectionTitle,
} from "./SuggestionInput";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import Loading from "../Loading";
import {applyTooltip} from "../../hooks/useTooltip";
import sortBy from "lodash/sortBy";
import orderBy from "lodash/orderBy";
import {intval} from "../../helpers/isWithinRange";
import map from "lodash/map";
import groupBy from "lodash/groupBy";
import {text} from "../../helpers/text";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

export const isStop = (item) =>
  typeof item.shortId !== "undefined" && typeof item.stopId !== "undefined";

const renderSectionTitle = (section) => {
  const headingToken =
    section.group === "stops" ? "filterpanel.stops" : "filterpanel.terminals";

  return <SuggestionSectionTitle>{text(headingToken)}</SuggestionSectionTitle>;
};

const getSectionSuggestions = (section) => section.options;

const getSuggestionItem = (suggestion) => {
  return suggestion;
};

const getSuggestionInputValue = (suggestion) => {
  if (typeof suggestion === "string") {
    return suggestion;
  }

  return get(suggestion, "stopId", "");
};

const renderSuggestion = (suggestion, {isHighlighted}) => {
  const suggestionIsStop = isStop(suggestion);
  const hoverInfo = (suggestionIsStop ? suggestion.routes : suggestion.stopIds) || [];
  const suggestionType = suggestionIsStop ? "stop" : "terminal";

  let idValue = suggestionType === "terminal" ? suggestion.id : suggestion.stopId;

  return (
    <SuggestionContent
      data-testid={`${suggestionType}-option-${idValue}`}
      {...applyTooltip(
        hoverInfo
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            const {routeId, direction, isTimingStop} = item;
            return `${routeId}/${direction}${isTimingStop ? " 🕒" : ""}`;
          })
          .join("\n")
      )}
      isHighlighted={isHighlighted}>
      <SuggestionText>
        {isStop(suggestion) ? (
          <strong>
            {idValue} ({(suggestion.shortId || "").replace(/ /g, "")})
          </strong>
        ) : (
          <strong>{idValue}</strong>
        )}
        <br />
        {suggestion.name}
      </SuggestionText>
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
    if (!val) {
      return "";
    }

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
      : stops.filter(({id, stopId, shortId, name}) => {
          const matchId = prepareMatchVal(id);
          const matchStopId = prepareMatchVal(stopId);
          const matchShortId = prepareMatchVal(shortId);
          const matchName = prepareMatchVal(name);

          let matches = 0;

          if (
            (matchShortId && matchShortId.startsWith(inputValue)) ||
            matchShortId.substring(1).startsWith(inputValue)
          ) {
            matches++;
          }

          if (matchId && matchId.startsWith(inputValue)) {
            matches++;
          }

          if (matchStopId && matchStopId.startsWith(inputValue)) {
            matches++;
          }

          if (matchName && matchName.includes(inputValue)) {
            matches++;
          }

          return matches > 0;
        });

  if (inputLength === 0) {
    return sortBy(filteredStops, ({shortId = ""}) => {
      const cityLetter = (shortId || "")[0];
      let sortValue = 0;

      if (cityLetter === "E") {
        sortValue = 10000;
      } else if (cityLetter === "V") {
        sortValue = 20000;
      } else if (cityLetter !== "H") {
        sortValue = 30000;
      }

      if (!sortValue) {
        return sortValue;
      }

      return intval((shortId || "").substring(1)) + sortValue;
    });
  }

  return orderBy(
    filteredStops,
    ({id, stopId, shortId, name}) => {
      let matchScore = 0;

      const cleanId = prepareMatchVal(id);
      const cleanStopId = prepareMatchVal(stopId);
      const cleanShortId = prepareMatchVal(shortId);
      const cleanName = prepareMatchVal(name);

      let checkValue = cleanName;
      let charIdx = 0;
      const firstInputChar = inputValue[0];

      if ([cleanShortId[0], cleanShortId[1]].includes(firstInputChar)) {
        charIdx = 1;
        matchScore = matchScore + 100;
        checkValue = cleanShortId;
      } else if (cleanId[0] === firstInputChar) {
        charIdx = 1;
        matchScore = matchScore + 20;
        checkValue = cleanId;
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

const getOptionGroups = (options = []) => {
  return orderBy(
    map(
      groupBy(options, (item) => (isStop(item) ? "stops" : "terminals")),
      (groupOptions, groupLabel) => ({
        group: groupLabel,
        options: groupOptions.slice(0, 500),
      })
    ),
    ({group}) => (group === "terminals" ? 0 : 1),
    "asc"
  );
};

export default observer(({date, stops, terminals, onSelect, stop, terminal, loading}) => {
  const allOptions = useMemo(() => [...terminals, ...stops], [stops, terminals]);
  const [options, setOptions] = useState(allOptions);

  const onSearch = useCallback(
    (searchQuery) => {
      const result = getFilteredSuggestions(allOptions, searchQuery);
      setOptions(result);
    },
    [stops]
  );

  const optionGroups = useMemo(() => getOptionGroups(options), [options]);

  return (
    <SuggestionInput
      testId="stop-input"
      helpText="Select stop"
      minimumInput={0}
      value={stop || terminal}
      onSelect={onSelect}
      getValue={getSuggestionItem}
      getInputValue={getSuggestionInputValue}
      highlightFirstSuggestion={true}
      multiSection={true}
      renderSectionTitle={renderSectionTitle}
      getSectionSuggestions={getSectionSuggestions}
      renderSuggestion={renderSuggestion}
      suggestions={optionGroups}
      renderSuggestionsContainer={renderSuggestionsContainer(loading)}
      onSuggestionsFetchRequested={onSearch}
    />
  );
});
