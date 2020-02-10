import React, {useMemo, useCallback} from "react";
import {observer} from "mobx-react-lite";
import {divIcon} from "leaflet";
import flow from "lodash/flow";
import orderBy from "lodash/orderBy";
import {useQueryData} from "../../hooks/useQueryData";
import gql from "graphql-tag";
import {getTransportIconHtml} from "../transportModes";
import {Marker, Tooltip} from "react-leaflet";
import {inject} from "../../helpers/inject";
import getTransportType from "../../helpers/getTransportType";
import {createGlobalStyle} from "styled-components";
import {getModeColor} from "../../helpers/vehicleColor";

const decorate = flow(observer, inject("state"));

export const terminalsQuery = gql`
  query terminalsQuery($date: Date) {
    terminals(date: $date) {
      id
      name
      lat
      lng
      modes
      stops
    }
  }
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

const TerminalLayer = decorate(({state: {date, mapOverlays, terminal}}) => {
  const {data: terminalsData} = useQueryData(
    terminalsQuery,
    {variables: {date}},
    "terminals query"
  );

  const terminals = terminalsData || [];

  const selectedTerminal = useMemo(() => {
    if (!terminal || terminals.length === 0) {
      return null;
    }

    return terminals.find((t) => t.id === terminal);
  }, [terminals, terminal]);

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
        html: `<div class="terminal-icon" style="${
          isSelected ? selectedTerminalStyle(color) : ""
        }">${getTransportIconHtml(mode, size)}</div>`,
        iconSize: [size, size],
      });
    },
    [terminal]
  );

  const createTerminalMarker = useCallback(
    (currentTerminal) => {
      const terminalIcon = getTerminalIcon(currentTerminal);

      return (
        <Marker
          key={currentTerminal.id}
          icon={terminalIcon}
          position={[currentTerminal.lat, currentTerminal.lng]}
          pane="terminal-markers">
          <Tooltip offset={[15, 0]} interactive={false} direction="right">
            <div>
              <strong>{currentTerminal.id}</strong>
            </div>
            <div style={{fontSize: "1rem"}}>{currentTerminal.name}</div>
          </Tooltip>
        </Marker>
      );
    },
    [terminal]
  );

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
