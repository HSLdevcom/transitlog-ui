import React from "react";
import {observer} from "mobx-react-lite";
import {text, Text} from "../../helpers/text";
import {ControlGroup, InputLabel} from "../Forms";
import styled from "styled-components";
import Input from "../Input";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import {useTooltip} from "../../hooks/useTooltip";

const SettingsWrapper = styled.div`
  padding-top: 0.5rem;
`;

const IncrementValueInput = styled(Input)`
  flex: 0 0 auto;
  width: auto;
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
          animatedLabel={false}
          onChange={(e) => Time.setTimeIncrement(e.target.value)}
        />
      </ControlGroup>
      <ControlGroup style={{marginBottom: 0, marginTop: "0.75rem"}}>
        <InputLabel>
          <Text>filterpanel.area_search_range</Text>
        </InputLabel>
      </ControlGroup>
      <ControlGroup>
        <IncrementValueInput
          style={{width: "auto"}}
          helpText="Search range minutes field"
          type="number"
          max={60}
          min={1}
          maxLength={2}
          value={areaSearchRangeMinutes}
          animatedLabel={false}
          onChange={(e) => Time.setAreaSearchMinutes(e.target.value)}
        />
        <input
          style={{width: "100%", flex: "1 1 100%"}}
          {...useTooltip("Search range minutes field")}
          type="range"
          max={60}
          min={1}
          value={areaSearchRangeMinutes}
          onChange={(e) => Time.setAreaSearchMinutes(e.target.value)}
        />
      </ControlGroup>
    </SettingsWrapper>
  );
});

export default AdditionalTimeSettings;
