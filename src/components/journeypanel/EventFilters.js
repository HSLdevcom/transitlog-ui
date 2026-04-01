import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import React, {useCallback} from "react";
import {applyTooltip} from "../../hooks/useTooltip";
import {text, helpText} from "../../helpers/text";

const EventFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 1rem;
`;

const FilterItem = styled.div``;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  margin: 0 0.25rem 0.25rem 0;
  padding: 0.15rem 0.2rem;
  border-radius: 5px;
  border: 1px solid var(--light-grey);
  font-size: 0.75rem;
  user-select: none;
`;

const FilterInput = styled.input``;
const decorate = flow(observer);

export default decorate(({onChange, filterState}) => {
  const onChangeFilter = useCallback(
    (name, currentValue) => {
      onChange({[name]: !currentValue});
    },
    [onChange]
  );

  return (
    <EventFilters>
      {Object.entries(filterState).map(([name, value]) => {
        const labelKey = `journey.event.short.${name}`;
        const labelText = text(labelKey);
        const label = labelText === labelKey ? name : labelText;

        const tooltipKey = name;
        const tooltipText = helpText(tooltipKey);
        const tooltip =
          tooltipText === tooltipKey ? text(`journey.event.${name}`) : tooltipText;

        return (
          <FilterItem key={name}>
            <FilterLabel {...applyTooltip(tooltip)}>
              <FilterInput
                type="checkbox"
                name={name}
                value={1}
                checked={value}
                onChange={() => onChangeFilter(name, value)}
              />
              {label}
            </FilterLabel>
          </FilterItem>
        );
      })}
    </EventFilters>
  );
});
