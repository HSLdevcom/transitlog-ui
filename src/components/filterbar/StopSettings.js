import React from "react";
import Input from "../Input";
import {text, Text} from "../../helpers/text";
import {ControlGroup, Button} from "../Forms";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopInput from "./StopInput";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";

@inject(app("Filters"))
@observer
class StopSettings extends React.Component {
  render() {
    const {Filters, state} = this.props;
    const {stop, route} = state;

    return (
      <>
        <ControlGroup>
          <Input label={text("filterpanel.filter_by_stop")} animatedLabel={false}>
            {!route.routeId ? (
              <AllStopsQuery key="all_stops">
                {({stops}) => (
                  <StopInput onSelect={Filters.setStop} stop={stop} stops={stops} />
                )}
              </AllStopsQuery>
            ) : (
              <StopsByRouteQuery
                key={`stop_input_by_route_${route.routeId}`}
                route={route}>
                {({stops}) => (
                  <StopInput onSelect={Filters.setStop} stop={stop} stops={stops} />
                )}
              </StopsByRouteQuery>
            )}
          </Input>
        </ControlGroup>
        {!!stop && (
          <Button primary={false} small={true} onClick={() => Filters.setStop("")}>
            <Text>filterpanel.clear.stop</Text>
          </Button>
        )}
      </>
    );
  }
}

export default StopSettings;
