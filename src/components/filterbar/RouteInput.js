import React, {useCallback, useState, useMemo} from "react";
import {createRouteId} from "../../helpers/keys";
import flow from "lodash/flow";
import orderBy from "lodash/orderBy";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import SuggestionInput, {SuggestionContent, SuggestionText} from "./SuggestionInput";
import getTransportType from "../../helpers/getTransportType";
import {parseLineNumber} from "../../helpers/parseLineNumber";
import sortBy from "lodash/sortBy";
import {text} from "../../helpers/text";

const decorate = flow(observer, inject("Filters"));

const renderSuggestion = (date, routes) => (suggestion, {isHighlighted}) => {
  const route = getFullRoute(routes, suggestion);
  const {routeId, direction, origin, destination} = route;

  return (
    <SuggestionContent
      data-testid={`route-option-${routeId}-${direction}`}
      isHighlighted={isHighlighted}
      withIcon={true}
      className={getTransportType(routeId)}>
      <SuggestionText withIcon={true}>
        <div>
          <strong>{routeId}</strong> {text("domain.direction")} {direction}
        </div>
        <div>{`${origin} - ${destination}`}</div>
      </SuggestionText>
    </SuggestionContent>
  );
};

const renderSuggestionsContainer = ({containerProps, children}) => {
  return (
    <div data-testid="route-suggestions-list" {...containerProps}>
      {children}
    </div>
  );
};

const getFilteredSuggestions = (routes, {value = ""}) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  let [searchRouteId, searchDirection = ""] = inputValue.split("/");
  searchDirection = parseInt(searchDirection.replace(/[^0-9]*/g, "") || 0, 10);

  const filteredRoutes =
    inputLength === 0
      ? routes
      : routes.filter(({routeId, direction}) => {
          const matchRouteId = routeId
            .trim()
            .replace(/\s/g, "")
            .toLowerCase();

          let matches = 0;

          if (matchRouteId.includes(searchRouteId)) {
            matches++;
          }

          if (parseLineNumber(matchRouteId).startsWith(searchRouteId)) {
            matches++;
          }

          if (searchDirection && direction === searchDirection) {
            matches++;
          } else if (searchDirection) {
            matches = 0;
          }

          return matches > 0;
        });

  if (inputLength === 0) {
    return sortBy(filteredRoutes, ({routeId}) => {
      const parsedLineId = parseLineNumber(routeId);
      const numericLineId = parsedLineId.replace(/[^0-9]*/g, "");
      const numericMode = getTransportType(routeId, true);

      if (!numericLineId) {
        return numericMode;
      }

      const lineNum = parseInt(numericLineId, 10);
      return numericMode + lineNum;
    });
  }

  return orderBy(
    filteredRoutes,
    ({routeId, direction}) => {
      let matchScore = 0;
      let isExactMatch = false;

      const cleanRouteId = routeId.trim().toLowerCase();

      // Sort routes with spaces or the letter h in them lower.
      if (/\s+|h+/g.test(cleanRouteId)) {
        matchScore = matchScore - 100;
      }

      const lineId = parseLineNumber(cleanRouteId);
      const matchValues = [lineId, cleanRouteId];

      for (const checkValue of matchValues) {
        // If it matches exactly, just give a huge pile of points and break.
        if (checkValue === searchRouteId) {
          matchScore += 1000;
          isExactMatch = true;
          break;
        }

        let charIdx = 0;

        // Loop through the given search term and match it
        // to a route or line ID, letter by letter.
        for (charIdx; charIdx < searchRouteId.length; charIdx++) {
          // Get the search char and set the index
          const char = searchRouteId[charIdx];
          let checkIdx = charIdx;

          // Loop through the route ID
          for (checkIdx; checkIdx < checkValue.length; checkIdx++) {
            const checkChar = checkValue[charIdx];
            // Reduce the given score by how far into the route ID we are from the current index.
            // 0 is a perfect match, more means a mismatch between the char indices.
            const distancePenalty = Math.abs(checkIdx - charIdx);

            if (char === checkChar) {
              // Increase the match score by the length of the search term and reduce by the penalty.
              matchScore = matchScore + (searchRouteId.length - distancePenalty);
              break; // Go to the next letter if this was a match!
            } else {
              // If no match, reduce the score.
              matchScore = matchScore - charIdx;
            }
          }
        }
      }

      // If we have an exact match, add the score for the direction if applicable.
      if (isExactMatch && searchDirection === direction) {
        matchScore += 1000;
      }

      return matchScore;
    },
    "desc"
  );
};

export const getFullRoute = (routes, selectedRoute) => {
  const routeId =
    typeof selectedRoute === "string" ? selectedRoute : createRouteId(selectedRoute);

  return routes.find((r) => createRouteId(r) === routeId) || null;
};

const RouteInput = decorate(({state: {route, date}, Filters, routes}) => {
  const [options, setOptions] = useState([]);

  const getValue = useCallback(
    (routeIdentifier) =>
      typeof routeIdentifier === "string"
        ? routeIdentifier
        : createRouteId(routeIdentifier),
    [routes]
  );

  const onSelect = useCallback(
    (selectedValue) => {
      if (!selectedValue) {
        return Filters.setRoute({routeId: "", direction: "", originStopId: ""});
      }

      const selectedRoute = getFullRoute(routes, selectedValue);

      if (selectedRoute) {
        Filters.setRoute(selectedRoute);
      }
    },
    [Filters, routes]
  );

  const getSuggestions = useCallback(
    (value) => {
      const nextOptions = getFilteredSuggestions(routes, value);
      setOptions(nextOptions);
    },
    [routes]
  );

  const hasRoutes = routes.length > 0;
  const suggestionRenderFn = useMemo(() => renderSuggestion(date, routes), [
    date,
    routes,
  ]);

  return (
    <SuggestionInput
      testId="route-input"
      disabled={!hasRoutes}
      helpText="Select route"
      minimumInput={0}
      value={getValue(route)}
      onSelect={onSelect}
      getValue={getValue}
      renderSuggestion={suggestionRenderFn}
      suggestions={options.slice(0, 50)}
      renderSuggestionsContainer={renderSuggestionsContainer}
      onSuggestionsFetchRequested={getSuggestions}
    />
  );
});

export default RouteInput;
