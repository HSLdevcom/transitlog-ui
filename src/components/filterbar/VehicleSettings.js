import React from "react";
import {text, Text} from "../../helpers/text";
import {ControlGroup, Button} from "../Forms";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import VehicleInput from "./VehicleInput";
import Input from "../Input";
import get from "lodash/get";
import sortBy from "lodash/sortBy";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import VehicleOptionsQuery from "../../queries/VehicleOptionsQuery";
import {getOperatorName} from "../../helpers/getOperatorNameById";

@inject(app("Filters"))
@observer
class VehicleSettings extends React.Component {
  onChangeQueryVehicle = (value) => {
    this.props.Filters.setVehicle(get(value, "unique_vehicle_id", ""));
  };

  renderInput(children, value, isDisabled = false) {
    return (
      <ControlGroup>
        <Input
          label={text("filterpanel.filter_by_vehicle")}
          animatedLabel={false}
          value={value}
          disabled={isDisabled}>
          {children}
        </Input>
      </ControlGroup>
    );
  }

  render() {
    const {state} = this.props;
    const {vehicle = "", date, selectedJourney} = state;

    const isDisabled = !!selectedJourney;

    if (isDisabled) {
      return this.renderInput(undefined, vehicle, true);
    }

    return (
      <>
        <VehicleOptionsQuery date={date}>
          {({vehicles}) => {
            const groupedVehicles = map(
              groupBy(
                sortBy(vehicles, "owner_operator_id"),
                ({owner_operator_id}) => owner_operator_id
              ),
              (vehicles, operatorId) => {
                return {
                  operatorName: getOperatorName(operatorId),
                  operatorId: operatorId,
                  vehicles: sortBy(vehicles, "vehicle_number"),
                };
              }
            );

            return this.renderInput(
              <VehicleInput
                options={groupedVehicles}
                value={vehicle}
                onSelect={this.onChangeQueryVehicle}
              />,
              vehicle
            );
          }}
        </VehicleOptionsQuery>
        {!!vehicle && (
          <Button
            primary={false}
            small={true}
            onClick={() => this.onChangeQueryVehicle("")}>
            <Text>filterpanel.clear.vehicle</Text>
          </Button>
        )}
      </>
    );
  }
}

export default VehicleSettings;
