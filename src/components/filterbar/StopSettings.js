import React from "react";
import Input from "../Input";
import {text} from "../../helpers/text";
import {ControlGroup, ClearButton} from "../Forms";
import {observer} from "mobx-react-lite";
import StopInput from "./StopInput";
import Tooltip from "../Tooltip";
import {SelectedOptionDisplay, SuggestionText} from "./SuggestionInput";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import styled from "styled-components";
import Loading from "../Loading";
import {useQueryData} from "../../hooks/useQueryData";
import {allStopsQuery} from "../map/StopLayer";
import {terminalsQuery} from "../map/TerminalLayer";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

const decorate = flow(observer, inject("Filters"));

const StopSettings = decorate(({Filters, state}) => {
  const {stop, date} = state;

  const {data: stopsData, loading} = useQueryData(
    allStopsQuery,
    {variables: {date}},
    "all stops query"
  );

  const {data: terminalsData} = useQueryData(
    terminalsQuery,
    {variables: {date}},
    "terminals query"
  );

  const stops = stopsData || [];
  const terminals = terminalsData || [];

  if (loading && stops.length === 0) {
    return <LoadingSpinner inline={true} />;
  }

  const selectedStop = stops.find((s) => s.id === stop);

  return (
    <>
      <ControlGroup>
        <Input label={text("filterpanel.filter_by_stop")} animatedLabel={false}>
          <StopInput
            date={date}
            onSelect={Filters.setStop}
            stop={stop}
            stops={stops}
            terminals={terminals}
            loading={loading}
          />
        </Input>
        {!!stop && (
          <Tooltip helpText="Clear stop">
            <ClearButton
              onClick={() => Filters.setStop("")}
              helpText={text("filterpanel.remove_stop")}
            />
          </Tooltip>
        )}
      </ControlGroup>
      {selectedStop && (
        <SelectedOptionDisplay data-testid="selected-stop-display">
          <SuggestionText>
            <strong>{selectedStop.id}</strong> ({selectedStop.shortId.replace(/\s/g, "")})
            <br />
            {selectedStop.name}
          </SuggestionText>
        </SelectedOptionDisplay>
      )}
    </>
  );
});

export default StopSettings;
