import React from "react";
import {observer} from "mobx-react-lite";
import {text} from "../../helpers/text";
import {ControlGroup} from "../Forms";
import styled from "styled-components";
import Input from "../Input";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import {useTooltip} from "../../hooks/useTooltip";

const SettingsWrapper = styled.div`
  padding-top: 0.5rem;
`;

const IncrementValueInput = styled(Input)`
  flex: 0 1 50%;
`;

const decorate = flow(
  observer,
  inject("Time")
);

const AdditionalTimeSettings = decorate(({state, Time}) => {
  const {timeIncrement, areaSearchRangeMinutes} = state;

  return (
    <SettingsWrapper>
      <ControlGroup>
        <IncrementValueInput
          helpText="Time increment field"
          label={text("filterpanel.time_increment")}
          type="number"
          max={60 * 60}
          maxLength={4}
          value={timeIncrement}
          onChange={(e) => Time.setTimeIncrement(e.target.value)}
        />
      </ControlGroup>
      <ControlGroup>
        <IncrementValueInput
          helpText="Search range minutes field"
          label={text("filterpanel.area_search_range")}
          type="number"
          max={60}
          min={5}
          maxLength={2}
          value={areaSearchRangeMinutes}
          onChange={(e) => Time.setAreaSearchMinutes(e.target.value)}
        />
        <input
          {...useTooltip("Search range minutes field")}
          type="range"
          max={60}
          min={5}
          value={areaSearchRangeMinutes}
          onChange={(e) => Time.setAreaSearchMinutes(e.target.value)}
        />
      </ControlGroup>
    </SettingsWrapper>
  );
});

export default AdditionalTimeSettings;
