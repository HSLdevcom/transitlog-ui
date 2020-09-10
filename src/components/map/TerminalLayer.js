import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import {divIcon, latLng} from "leaflet";
import flow from "lodash/flow";
import orderBy from "lodash/orderBy";
import {useQueryData} from "../../hooks/useQueryData";
import gql from "graphql-tag";
import {getTransportIconHtml} from "../transportModes";
import {Marker, Tooltip} from "react-leaflet";
import {inject} from "../../helpers/inject";
import getTransportType from "../../helpers/getTransportType";
import {createGlobalStyle} from "styled-components";
import {getModeColor, getPriorityMode} from "../../helpers/vehicleColor";
import {
  StopPopupContentSection,
  StopStreetViewWrapper,
  StopContentWrapper,
} from "./StopPopupContent";
import {Text} from "../../helpers/text";
import get from "lodash/get";
import flatten from "lodash/flatten";
import uniqBy from "lodash/uniqBy";
import MapPopup from "./MapPopup";
import {Heading} from "../Typography";
import {Button} from "../Forms";
import {RouteStopFieldsFragment} from "../../queries/StopFieldsFragment";
import RouteSelect from "../RouteSelect";
import {useCenterOnPopup} from "../../hooks/useCenterOnPopup";

const decorate = flow(observer, inject("Filters", "UI"));
const decoratePopup = flow(observer, inject("UI"));

export const terminalsQuery = gql`
  query terminalsQuery($date: Date) {
    terminals(date: $date) {
      id
      name
      lat
      lng
      modes
      stopIds
    }
  }
`;

export const singleTerminalQuery = gql`
  query terminalQuery($terminalId: String, $date: Date) {
    terminal(terminalId: $terminalId, date: $date) {
      id
      name
      lat
      lng
      modes
      stopIds
      stops {
        ...RouteStopFieldsFragment
      }
    }
  }
  ${RouteStopFieldsFragment}
`;

const TerminalIconStyle = createGlobalStyle`
  .terminal-icon {
    width: 100%;
    height: 100%;
    text-indent: 0;
    display: flex;
    border-radius: 3px;
    align-items: center;
    justify-content: center;
    background-color: transparent;
  }
`;

const selectedTerminalStyle = (color = "var(--bus-blue)") =>
  `border: 2px solid white; box-shadow: 0 0 0 2px ${color};`;

const SelectedTerminalPopup = decoratePopup(({terminal, UI, open}) => {
  const terminalMode = getPriorityMode(get(terminal, "modes", []));
  const terminalColor = getModeColor(terminalMode);

  const terminalStops = terminal.stops || [];
  const terminalRoutes = flatten(terminalStops.map((stop) => stop.routes || []));
  const uniqueRoutes = uniqBy(terminalRoutes, (r) => `${r.routeId}/${r.direction}`);

  return (
    <MapPopup open={open}>
      <StopContentWrapper data-testid={`terminal-popup terminal-popup-${terminal.id}`}>
        <StopPopupContentSection>
          <Heading level={4}>
            {terminal.id} {terminal.name}
          </Heading>
          <RouteSelect routes={uniqueRoutes} color={terminalColor} />
        </StopPopupContentSection>
        <StopStreetViewWrapper>
          <Button
            onClick={() =>
              UI.setMapillaryViewerLocation(latLng([terminal.lat, terminal.lng]))
            }>
            <Text>map.stops.show_in_streetview</Text>
          </Button>
        </StopStreetViewWrapper>
      </StopContentWrapper>
    </MapPopup>
  );
});

const TerminalLayer = decorate(({Filters, state}) => {
  const {date, mapOverlays, terminal, selectedJourney} = state;

  const {data: terminalsData} = useQueryData(
    terminalsQuery,
    {variables: {date}},
    "terminals query"
  );

  const terminals = terminalsData || [];

  const {data: selectedTerminal, loading: selectedTerminalLoading} = useQueryData(
    singleTerminalQuery,
    {
      skip: !terminal,
      variables: {
        date,
        terminalId: terminal,
      },
    }
  );

  const getTerminalIcon = useCallback(
    (currentTerminal) => {
      const orderedModes = orderBy(currentTerminal.modes || ["DEFAULT"], (mode) =>
        getTransportType(mode, true)
      );

      const mode = orderedModes[0];

      const isSelected = currentTerminal.id === terminal;
      const size = isSelected ? 30 : 20;
      const color = getModeColor(mode);

      return divIcon({
        html: `<div data-testid="terminal-marker-${
          currentTerminal.id
        }" class="terminal-icon" style="${
          isSelected ? selectedTerminalStyle(color) : ""
        }">${getTransportIconHtml(mode, size)}</div>`,
        iconSize: [size, size],
      });
    },
    [terminal]
  );

  const createTerminalMarker = useCallback(
    (currentTerminal) => {
      const isSelected = selectedTerminal && currentTerminal.id === selectedTerminal.id;
      const terminalIcon = getTerminalIcon(currentTerminal);

      return (
        <Marker
          onClick={() => Filters.setTerminal(currentTerminal.id)}
          key={currentTerminal.id}
          icon={terminalIcon}
          position={[currentTerminal.lat, currentTerminal.lng]}
          pane="terminal-markers">
          {isSelected && !selectedTerminalLoading && (
            <SelectedTerminalPopup open={true} terminal={selectedTerminal} />
          )}
          <Tooltip offset={[15, 0]} interactive={false} direction="right">
            <div>
              <strong>{currentTerminal.id}</strong>
            </div>
            <div style={{fontSize: "1rem"}}>{currentTerminal.name}</div>
          </Tooltip>
        </Marker>
      );
    },
    [terminal, selectedTerminal, selectedTerminalLoading]
  );

  useCenterOnPopup([
    !selectedJourney,
    !!terminal,
    !!selectedTerminal,
    !selectedTerminalLoading,
  ]);

  const terminalsVisible = mapOverlays.includes("Terminals");

  if (!terminalsVisible && !selectedTerminal) {
    return null;
  }

  return (
    <>
      <TerminalIconStyle />
      {terminalsVisible &&
        terminals.map((currentTerminal) => createTerminalMarker(currentTerminal))}
      {!terminalsVisible && !!selectedTerminal && createTerminalMarker(selectedTerminal)}
    </>
  );
});

export default TerminalLayer;
