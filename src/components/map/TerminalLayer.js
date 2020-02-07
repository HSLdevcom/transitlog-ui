import React from "react";
import {observer} from "mobx-react-lite";
import {divIcon} from "leaflet";
import {flow} from "lodash";
import {useQueryData} from "../../hooks/useQueryData";
import gql from "graphql-tag";
import {transportIconsHtml} from "../transportModes";
import {Marker} from "react-leaflet";
import {inject} from "../../helpers/inject";

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

const terminalIconStyle = `width: 100%;
height: 100%;
text-indent: 0;
display: flex;
align-items: center;
justify-content: center;
background-color: transparent`;

const TerminalLayer = decorate(({state: {date}}) => {
  const {data: terminalsData} = useQueryData(
    terminalsQuery,
    {variables: {date}},
    "terminals query"
  );

  const terminals = terminalsData || [];

  return (
    <>
      {terminals.map((terminal) => {
        const mainMode = terminal.modes[0] || "DEFAULT";

        const terminalIcon = divIcon({
          html: `<div style="${terminalIconStyle}">${transportIconsHtml[mainMode]}</div>`,
          iconSize: [20, 20],
        });

        return (
          <Marker
            key={terminal.id}
            icon={terminalIcon}
            position={[terminal.lat, terminal.lng]}
            pane="terminal-markers"
          />
        );
      })}
    </>
  );
});

export default TerminalLayer;
