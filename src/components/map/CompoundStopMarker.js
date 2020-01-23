import React, {useRef, useEffect} from "react";
import {observer} from "mobx-react-lite";
import {Heading} from "../Typography";
import get from "lodash/get";
import compact from "lodash/compact";
import uniq from "lodash/uniq";
import styled, {css} from "styled-components";
import {latLng} from "leaflet";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import StopPopupContent, {StopPopupContentSection} from "./StopPopupContent";
import MapPopup from "./MapPopup";
import StopMarker from "./StopMarker";
import {Text} from "../../helpers/text";
import {Tooltip} from "react-leaflet";
import {Button} from "../Forms";

const StopOptionButton = styled(Button).attrs(() => ({small: true}))`
  text-decoration: none;
  color: white;
  border: 0;
  margin: 0 0.5rem 0.5rem 0;
  background: ${({color = "var(--lightest-grey)"}) =>
    color ? color : "var(--lightest-grey)"};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  font-family: var(--font-family);
  font-size: 0.875rem;
  padding: 0.25rem 1rem 0.25rem 0.5rem;
  height: auto;

  ${(p) =>
    p.selected
      ? css`
          border: 2px solid white;
          box-shadow: 0 0 0 2px
            ${({color = "var(--lightest-grey)"}) =>
              color ? color : "var(--lightest-grey)"};
        `
      : ""}

  &:hover {
    background: ${({color = "var(--lightest-grey)"}) =>
      color ? color : "var(--lightest-grey)"};
    border: 0;
  }
`;

const StopGroupContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const ChooseStopHeading = styled(Heading).attrs({level: 4})`
  margin-top: 0;
  margin-bottom: 0.5rem;
`;

const CompoundStopMarker = observer(
  ({
    selected,
    stops = [],
    selectedStop,
    highlightedStop,
    showRadius = true,
    bounds,
    setRoute,
    setStop,
  }) => {
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

    const selectedStopObj =
      selectedStop && stops.length !== 0
        ? stops.find((stop) => stop.stopId === selectedStop)
        : null;

    const modesInCluster = uniq(
      compact(stops.map((stop) => getPriorityMode(get(stop, "modes", ["BUS"]))))
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
        stop={selectedStopObj}
        selectedStop={selectedStop}
        highlightedStop={highlightedStop}
        setRoute={setRoute}
        setStop={setStop}
        iconChildren={stops.length}>
        <MapPopup
          onClose={() => (popupOpen.current = false)}
          onOpen={() => (popupOpen.current = true)}>
          <StopPopupContentSection style={{backgroundColor: "var(--lightest-grey)"}}>
            <ChooseStopHeading>
              <Text>map.stops.select_stop</Text>
            </ChooseStopHeading>
            <StopGroupContainer>
              {stops.map((stopInGroup) => {
                const mode = getPriorityMode(get(stopInGroup, "modes", []));
                const stopColor = getModeColor(mode);

                return (
                  <StopOptionButton
                    selected={
                      !!selectedStopObj && selectedStopObj.stopId === stopInGroup.stopId
                    }
                    color={stopColor}
                    onClick={() => setStop(stopInGroup.stopId)}
                    key={`stop_select_${stopInGroup.stopId}`}>
                    {stopInGroup.stopId} - {stopInGroup.name}
                  </StopOptionButton>
                );
              })}
            </StopGroupContainer>
          </StopPopupContentSection>
          {selectedStopObj && (
            <StopPopupContent
              stop={selectedStopObj}
              color={stopColor}
              onSelectRoute={setRoute}
            />
          )}
        </MapPopup>
        {!selectedStopObj && (
          <Tooltip offset={[15, 0]} interactive={false} direction="right">
            {stops.map((stopInGroup, idx) => (
              <div
                key={`stop_tooltip_${stopInGroup.id}`}
                style={{marginTop: idx === 0 ? 0 : "0.5rem"}}>
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
