import React, {useMemo, useState, useCallback} from "react";
import SuggestionInput, {
  SuggestionContent,
  SuggestionText,
  SuggestionSectionTitle,
} from "./SuggestionInput";
import flow from "lodash/flow";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import orderBy from "lodash/orderBy";
import map from "lodash/map";
import groupBy from "lodash/groupBy";
import {useSearch} from "../../hooks/useSearch";
import {isNumeric} from "../../helpers/isNumeric";

const VehicleSuggestion = styled(SuggestionContent)`
  color: ${({inService = true, isHighlighted = false}) =>
    isHighlighted ? "white" : inService ? "var(--dark-grey)" : "var(--light-grey)"};
`;

const getSuggestionValue = (suggestion) => {
  if (typeof suggestion === "string") {
    return suggestion;
  }

  return get(suggestion, "id", "");
};

const renderSuggestion = (suggestion, {query, isHighlighted}) => {
  const registryNr = get(suggestion, "registryNr", "");
  let uniqueVehicleId = getSuggestionValue(suggestion);

  if (registryNr) {
    uniqueVehicleId = (
      <>
        <span data-testid="vehicle-option-label">{uniqueVehicleId}</span> {registryNr}
      </>
    );
  }

  const isInService =
    typeof suggestion.inService === "undefined" || suggestion.inService === true;

  return (
    <VehicleSuggestion
      data-testid={`vehicle-option ${isInService ? "vehicle-option-in-service" : ""}`}
      isHighlighted={isHighlighted}
      inService={isInService}>
      <SuggestionText>{uniqueVehicleId}</SuggestionText>
    </VehicleSuggestion>
  );
};

const renderSectionTitle = (section) => (
  <SuggestionSectionTitle>{section.operator}</SuggestionSectionTitle>
);

const getSectionSuggestions = (section) => section.vehicles;

const getVehicleGroups = (vehicles = [], sortByMatchScore = false) => {
  const sortDirection = sortByMatchScore ? "desc" : "asc";

  return orderBy(
    map(
      groupBy(
        vehicles,
        ({operatorName, operatorId}) => `${operatorName} (${operatorId})`
      ),
      (vehicles, groupLabel) => ({
        operator: groupLabel,
        vehicles: orderBy(vehicles, "vehicleId", sortDirection).slice(0, 50),
      })
    ),
    ({operator}) => /\(([^)]+)\)/.exec(operator),
    sortDirection
  ).slice(0, 5);
};

const enhance = flow(observer);

export default enhance(({value = "", onSelect, vehicles = []}) => {
  const [options, setOptions] = useState(vehicles);

  const doSearch = useSearch(
    vehicles,
    (queryVal) =>
      isNumeric(queryVal)
        ? [
            {name: "vehicleId", weight: 0.45},
            {name: "operatorId", weight: 0.65},
          ]
        : [
            {name: "id", weight: 0.2},
            {name: "operatorName", weight: 0.3},
            {name: "registryNr", weight: 0.3},
            {name: "exteriorColor", weight: 0.1},
            {name: "emissionDesc", weight: 0.1},
          ],
    {threshold: 0.2}
  );

  const onSearch = useCallback(
    (searchQuery = "") => {
      const result = doSearch(searchQuery);
      setOptions(result);
    },
    [doSearch]
  );

  const vehicleOptionGroups = useMemo(() => getVehicleGroups(options), [options]);

  return (
    <SuggestionInput
      testId="vehicle-search-input"
      helpText="Select vehicle"
      minimumInput={0}
      value={value}
      onSelect={onSelect}
      multiSection={true}
      renderSectionTitle={renderSectionTitle}
      getSectionSuggestions={getSectionSuggestions}
      getValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      suggestions={vehicleOptionGroups}
      onSuggestionsFetchRequested={onSearch}
    />
  );
});
