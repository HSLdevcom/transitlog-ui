import React from "react";
import Input from "../Input";
import {text} from "../../helpers/text";
import {ControlGroup, ClearButton} from "../Forms";
import {observer, Observer} from "mobx-react-lite";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopInput from "./StopInput";
import Tooltip from "../Tooltip";
import {SelectedOptionDisplay, SuggestionText} from "./SuggestionInput";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import styled from "styled-components";
import Loading from "../Loading";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

const decorate = flow(observer, inject("Filters"));

const StopSettings = decorate(({Filters, state}) => {
  const {stop, date} = state;

  return (
    <AllStopsQuery date={date}>
      {({stops = [], loading}) => (
        <Observer>
          {() => {
            const selectedStop = stops.find((s) => s.id === stop);

            if (loading && stops.length === 0) {
              return <LoadingSpinner inline={true} />;
            }

            return (
              <>
                <ControlGroup>
                  <Input label={text("filterpanel.filter_by_stop")} animatedLabel={false}>
                    <StopInput
                      date={date}
                      onSelect={Filters.setStop}
                      stop={stop}
                      stops={stops}
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
                      <strong>{selectedStop.id}</strong> (
                      {selectedStop.shortId.replace(/\s/g, "")})
                      <br />
                      {selectedStop.name}
                    </SuggestionText>
                  </SelectedOptionDisplay>
                )}
              </>
            );
          }}
        </Observer>
      )}
    </AllStopsQuery>
  );
});

export default StopSettings;
