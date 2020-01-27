import React, {useCallback} from "react";
import {text} from "../../helpers/text";
import {ControlGroup, ClearButton} from "../Forms";
import {observer, Observer} from "mobx-react-lite";
import VehicleInput from "./VehicleInput";
import Input from "../Input";
import flow from "lodash/flow";
import VehicleOptionsQuery from "../../queries/VehicleOptionsQuery";
import Tooltip from "../Tooltip";
import {inject} from "../../helpers/inject";
import {SelectedOptionDisplay, SuggestionText} from "./SuggestionInput";
import styled from "styled-components";
import Loading from "../Loading";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

const UnsignedEventsLoading = styled(Loading).attrs({inline: true, size: 20})`
  margin-left: auto;
  position: relative;
  top: 5px;
  right: -10px;
`;

const decorate = flow(observer, inject("Filters"));

const VehicleSettings = decorate(({Filters, state, unsignedEventsLoading}) => {
  const onSelectVehicle = useCallback((value) => Filters.setVehicle(value), [Filters]);

  const {vehicle = "", date, selectedJourney} = state;
  const isDisabled = !!selectedJourney;
  const fieldLabel = text("filterpanel.filter_by_vehicle");

  return (
    <VehicleOptionsQuery date={date}>
      {({vehicles = [], loading}) => (
        <Observer>
          {() => {
            const selectedVehicle = vehicles.find((v) => v.id === vehicle);

            if (loading && vehicles.length === 0) {
              return <LoadingSpinner inline={true} />;
            }

            return (
              <>
                <ControlGroup>
                  <Input
                    helpText="Select vehicle"
                    label={fieldLabel}
                    animatedLabel={false}
                    value={vehicle}
                    disabled={isDisabled}>
                    <VehicleInput
                      vehicles={vehicles}
                      value={vehicle}
                      onSelect={onSelectVehicle}
                    />
                  </Input>
                  {!!vehicle && (
                    <Tooltip helpText="Clear vehicle">
                      <ClearButton
                        helpText={text("filterpanel.filter_by_vehicle")}
                        primary={false}
                        small={true}
                        onClick={() => Filters.setVehicle("")}
                      />
                    </Tooltip>
                  )}
                </ControlGroup>
                {selectedVehicle && (
                  <SelectedOptionDisplay
                    data-testid="selected-vehicle-display"
                    withIcon={false}>
                    <SuggestionText withIcon={false}>
                      <strong>{selectedVehicle.id}</strong> {selectedVehicle.registryNr}
                      <br />
                      {selectedVehicle.operatorName}
                    </SuggestionText>
                    {unsignedEventsLoading && <UnsignedEventsLoading _testWait={false} />}
                  </SelectedOptionDisplay>
                )}
              </>
            );
          }}
        </Observer>
      )}
    </VehicleOptionsQuery>
  );
});

export default VehicleSettings;
