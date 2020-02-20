import React, {useCallback} from "react";
import Input from "../Input";
import {text} from "../../helpers/text";
import {ControlGroup, ClearButton} from "../Forms";
import {observer} from "mobx-react-lite";
import StopInput, {isStop} from "./StopInput";
import Tooltip from "../Tooltip";
import {SelectedOptionDisplay, SuggestionText} from "./SuggestionInput";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import styled from "styled-components";
import Loading from "../Loading";
import {useQueryData} from "../../hooks/useQueryData";
import {allStopsQuery} from "../map/StopLayer";
import {terminalsQuery} from "../map/TerminalLayer";
import orderBy from "lodash/orderBy";
import getTransportType from "../../helpers/getTransportType";
import {SidePanelTabs} from "../../constants";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

const decorate = flow(observer, inject("Filters", "UI"));

const StopSettings = decorate(({Filters, UI, state}) => {
  const {stop, terminal, date} = state;

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

  const onSelectOption = useCallback(
    (item) => {
      if (isStop(item)) {
        Filters.setStop(item);
      } else {
        Filters.setTerminal(item);
      }

      if (item) {
        UI.setSidePanelTab(SidePanelTabs.Timetables);
      }
    },
    [Filters, UI]
  );

  if (loading && stops.length === 0) {
    return <LoadingSpinner inline={true} />;
  }

  const selectedStop = stops.find((s) => s.id === stop);
  const selectedTerminal = terminals.find((t) => t.id === terminal);

  let terminalMode = "BUS";

  if (selectedTerminal) {
    const orderedModes = orderBy(selectedTerminal.modes || ["BUS"], (mode) =>
      getTransportType(mode, true)
    );

    terminalMode = orderedModes[0];
  }

  return (
    <>
      <ControlGroup>
        <Input label={text("filterpanel.filter_by_stop")} animatedLabel={false}>
          <StopInput
            date={date}
            onSelect={onSelectOption}
            stop={stop}
            terminal={terminal}
            stops={stops}
            terminals={terminals}
            loading={loading}
          />
        </Input>
        {(!!stop || !!terminal) && (
          <Tooltip helpText="Clear stop">
            <ClearButton
              onClick={() => {
                Filters.setStop("");
                Filters.setTerminal("");
              }}
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
      {selectedTerminal && (
        <SelectedOptionDisplay
          data-testid="selected-terminal-display"
          withIcon={true}
          className={terminalMode}>
          <SuggestionText withIcon={true}>
            <strong>{selectedTerminal.id}</strong>
            <br />
            {selectedTerminal.name}
          </SuggestionText>
        </SelectedOptionDisplay>
      )}
    </>
  );
});

export default StopSettings;
