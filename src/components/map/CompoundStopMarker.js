import React, {useRef, useEffect, useCallback} from "react";
import {observer} from "mobx-react-lite";
import {Heading} from "../Typography";
import get from "lodash/get";
import compact from "lodash/compact";
import uniq from "lodash/uniq";
import flow from "lodash/flow";
import flatten from "lodash/flatten";
import styled from "styled-components";
import {latLng} from "leaflet";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import {inject} from "../../helpers/inject";
import StopPopupContent, {StopPopupContentSection} from "./StopPopupContent";
import MapPopup from "./MapPopup";
import StopMarker from "./StopMarker";
import {Text} from "../../helpers/text";
import {Tooltip} from "react-leaflet";

const StopOptionButton = styled.button`
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  background: var(--lightest-grey);
  margin: 0 0 0.5rem 0;
  display: block;
  border: ${({color = "var(--lightest-grey)"}) =>
    color ? `3px solid ${color}` : "3px solid var(--lightest-grey)"};
  cursor: pointer;

  &:hover {
    background-color: var(--lighter-grey);
  }
`;

const ChooseStopHeading = styled(Heading).attrs({level: 4})`
  margin-top: 0;
  margin-bottom: 0.5rem;
`;

const decorate = flow(
  observer,
  inject("Filters")
);

const CompoundStopMarker = decorate(
  ({selected, stops = [], state, showRadius = true, bounds, Filters}) => {
    const popupOpen = useRef(false);
    const markerRef = useRef(null);

    useEffect(() => {
      if (!markerRef.current) {
        return;
      }

      if (selected && !popupOpen.current) {
        markerRef.current.leafletElement.openPopup();
        popupOpen.current = true;
      } else if (!selected && popupOpen.current) {
        markerRef.current.leafletElement.closePopup();
      }
    }, [selected, markerRef.current, popupOpen.current]);

    const selectRoute = useCallback(
      (route) => () => {
        if (route) {
          Filters.setRoute(route);
        }
      },
      []
    );

    const selectStop = useCallback((stopId) => {
      if (stopId) {
        Filters.setStop(stopId);
      }
    }, []);

    const {stop: selectedStop} = state;

    const selectedStopObj =
      selectedStop && stops.length !== 0
        ? stops.find((stop) => stop.stopId === selectedStop)
        : null;

    const modesInCluster = uniq(
      compact(stops.map((stop) => getPriorityMode(get(stop, "modes", ["BUS"]))))
    );

    const alertsInCluster = flatten(
      stops.map(({alerts = []}) => (alerts && Array.isArray(alerts) ? alerts : []))
    );

    let mode =
      modesInCluster.length === 0
        ? "BUS"
        : modesInCluster.length === 1
        ? modesInCluster[0]
        : getPriorityMode(modesInCluster);

    let stopColor = getModeColor(mode);

    if (selectedStopObj) {
      mode = getPriorityMode(get(selectedStopObj, "modes", ["BUS"]));
      stopColor = getModeColor(mode);
    }

    const markerPosition = selectedStopObj
      ? latLng(selectedStopObj.lat, selectedStopObj.lng)
      : bounds.getCenter();

    return (
      <StopMarker
        position={markerPosition}
        mode={mode}
        showRadius={showRadius}
        markerRef={markerRef}
        alerts={alertsInCluster}
        stop={selectedStopObj}
        iconChildren={stops.length}>
        <MapPopup
          onClose={() => (popupOpen.current = false)}
          onOpen={() => (popupOpen.current = true)}>
          <StopPopupContentSection>
            <ChooseStopHeading>
              <Text>map.stops.select_stop</Text>
            </ChooseStopHeading>
            {stops.map((stopInGroup) => {
              const mode = getPriorityMode(get(stopInGroup, "modes", []));
              const stopColor = getModeColor(mode);

              return (
                <StopOptionButton
                  color={stopColor}
                  onClick={() => selectStop(stopInGroup.stopId)}
                  key={`stop_select_${stopInGroup.stopId}`}>
                  {stopInGroup.stopId} - {stopInGroup.name}
                </StopOptionButton>
              );
            })}
          </StopPopupContentSection>
          {selectedStopObj && (
            <StopPopupContent
              stop={selectedStopObj}
              color={stopColor}
              onSelectRoute={selectRoute}
            />
          )}
        </MapPopup>
        {!selectedStopObj && (
          <Tooltip offset={[15, 0]} interactive={false} direction="right">
            {stops.map((stopInGroup, idx) => (
              <div
                key={`stop_tooltip_${stopInGroup.id}`}
                style={{marginTop: idx === 0 ? 0 : "1rem"}}>
                <div>
                  <strong>{stopInGroup.shortId.replace(/\s*/g, "")}</strong>{" "}
                  {stopInGroup.stopId}
                </div>
                <div style={{fontSize: "1rem"}}>{stopInGroup.name}</div>
              </div>
            ))}
          </Tooltip>
        )}
      </StopMarker>
    );
  }
);

export default CompoundStopMarker;
