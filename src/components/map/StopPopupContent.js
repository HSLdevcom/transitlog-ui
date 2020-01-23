import {Heading} from "../Typography";
import StopRouteSelect from "./StopRouteSelect";
import {Text} from "../../helpers/text";
import React from "react";
import styled from "styled-components";
import AlertsList from "../AlertsList";
import {StopContent} from "../StopElements";
import {Button} from "../Forms";
import {observer} from "mobx-react-lite";
import {flow} from "lodash";
import {inject} from "../../helpers/inject";
import {latLng} from "leaflet";

export const StopPopupContentSection = styled.div`
  padding: 0 1rem 0.5rem;

  &:first-child {
    padding-top: 1rem;
  }

  &:last-child {
    padding-bottom: 1rem;
  }
`;

export const StopContentWrapper = styled(StopContent)`
  font-family: inherit;
  font-size: 1rem;
  padding: 0;
`;

export const StopStreetViewWrapper = styled(StopPopupContentSection)`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const decorate = flow(
  observer,
  inject("UI")
);

const StopPopupContent = decorate(({UI, color, stop}) => {
  return (
    <StopContentWrapper data-testid={`stop-popup stop-popup-${stop.stopId}`}>
      <StopPopupContentSection>
        <Heading level={4}>
          {stop.name}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Heading>
        <StopRouteSelect color={color} stopId={stop.stopId} />
      </StopPopupContentSection>
      <StopStreetViewWrapper>
        <Button
          onClick={() => UI.setMapillaryViewerLocation(latLng([stop.lat, stop.lng]))}>
          <Text>map.stops.show_in_streetview</Text>
        </Button>
      </StopStreetViewWrapper>
    </StopContentWrapper>
  );
});

export default StopPopupContent;
