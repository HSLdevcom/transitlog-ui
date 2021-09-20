import React, {useState, useCallback} from "react";
import Input from "../Input";
import {text} from "../../helpers/text";
import {ControlGroup, ClearButton} from "../Forms";
import {observer} from "mobx-react-lite";
import LocationInput from "./LocationInput";
import Tooltip from "../Tooltip";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";

const decorate = flow(observer, inject("Filters", "UI"));

const LocationSettings = decorate(({Filters, UI, state}) => {
  const [location, setLocation] = useState();
  const onSelectOption = useCallback(
    (e) => {
      if (e.lat && e.lon) {
        UI.setLocationMarker({lat: e.lat, lng: e.lon});
        UI.setMapView({lat: e.lat, lng: e.lon});
        setLocation(e.id);
      }
    },
    [Filters, UI]
  );
  return (
    <>
      <ControlGroup>
        <Input label={text("filterpanel.filter_by_location")} animatedLabel={false}>
          <LocationInput onSelect={onSelectOption} location={location} />
        </Input>
        {!!location && (
          <Tooltip helpText="Clear stop">
            <ClearButton
              onClick={() => {
                setLocation(null);
                UI.setLocationMarker(null);
              }}
              helpText={text("filterpanel.remove_stop")}
            />
          </Tooltip>
        )}
      </ControlGroup>
    </>
  );
});

export default LocationSettings;
