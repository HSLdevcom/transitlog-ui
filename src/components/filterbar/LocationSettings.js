import React, {useState, useCallback} from "react";
import Input from "../Input";
import {text} from "../../helpers/text";
import {ControlGroup, ClearButton} from "../Forms";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import LocationInput from "./LocationInput";
import Tooltip from "../Tooltip";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";

const ContentWrapper = styled.div`
  width: 100%;
  display: block;
`;

const ErrorText = styled.div`
  padding-top: 5px;
  color: var(--grey);
  font-size: 0.9rem;
`;

const InputWrapper = styled.div`
  display: flex;
  align-content: center;
  align-items: flex-end;
`;

const decorate = flow(observer, inject("Filters", "UI"));

const LocationSettings = decorate(({Filters, UI, state}) => {
  const [location, setLocation] = useState();
  const [noResults, setNoResults] = useState();
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
  const onChange = useCallback(
    (e) => {
      const showError =
        e.searchQuery && e.searchQuery.value.length > 0 && e.result.length === 0;
      setNoResults(showError);
    },
    [Filters, UI]
  );
  return (
    <>
      <ControlGroup>
        <ContentWrapper>
          <InputWrapper>
            <Input label={text("filterpanel.filter_by_location")} animatedLabel={false}>
              <LocationInput
                onSelect={onSelectOption}
                location={location}
                onChange={onChange}
              />
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
          </InputWrapper>
          {noResults && <ErrorText>Ei hakutuloksia.</ErrorText>}
        </ContentWrapper>
      </ControlGroup>
    </>
  );
});

export default LocationSettings;
