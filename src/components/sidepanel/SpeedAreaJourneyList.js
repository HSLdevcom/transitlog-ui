import React, {useState, useCallback} from "react";
import {observer} from "mobx-react-lite";
import SidepanelList from "./SidepanelList";
import getJourneyId from "../../helpers/getJourneyId";
import styled from "styled-components";
import flow from "lodash/flow";
import get from "lodash/get";
import {inject} from "../../helpers/inject";
import EmptyView from "../EmptyView";
import {text} from "../../helpers/text";
import Tooltip from "../Tooltip";
import ClipBoard from "../../icons/ClipBoard";

const ListHeader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 5px;
  font-size: 1rem;
`;

const ListWrapper = styled.div``;

const TableRowsHeader = styled.div`
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--lightest-grey);
  background-color: #ececf3;
  flex-wrap: nowrap;
  cursor: pointer;
`;

const TableRow = styled.div`
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--lightest-grey);
  flex-wrap: nowrap;
  cursor: pointer;
  :hover {
    background-color: var(--lightest-blue);
  }
  ${({selected}) =>
    selected &&
    `
    background-color: var(--lightest-blue);
  `}
`;

const TableBody = styled.div`
  padding-top: 2rem;
`;

const TableCell = styled.div`
  width: 4.125rem;
  padding: 0.5rem 0.25rem;
  flex: 1 1 auto;
  text-align: center;
  border: 0;
  border-right: 1px solid var(--lightest-grey);
  font-size: 0.75rem;
  position: relative;

  &:last-child {
    border-right: 0;
  }
`;

const TableHeader = styled(TableRowsHeader)`
  font-weight: bold;
  border-bottom-width: 1px;
  border-color: var(--alt-grey);
  background-color: #fdfdff;

  ${TableCell} {
    border-color: var(--alt-grey);
  }
`;

const CopyButton = styled.div`
  width: fit-content;
  height: 22px;
  border-radius: 3px;
  background-color: #007ac9;
  cursor: pointer;
  margin: 0.2rem;
  :hover {
    transform: scale(1.025);
    background-color: var(--dark-blue);
  }
`;

const HeaderContainer = styled.div`
  display: flex;
`;

const HeaderText = styled.div`
  margin: 0.2rem;
`;

const decorate = flow(observer, inject("Journey", "Time", "UI"));

const SpeedAreaJourneyList = decorate(
  ({
    Journey,
    areaSpeeds,
    loading,
    Time,
    state: {language, speedFilter, date, selectedJourney},
  }) => {
    const vehiclepositions = areaSpeeds.flatMap((journey) => {
      return journey.vehiclePositions.map((vehiclePosition) => {
        const speed = Math.round(vehiclePosition.velocity * 3.6 * 100) / 100;
        return {
          ...vehiclePosition,
          departureTime: journey.departureTime,
          routeId: journey.routeId,
          operatorId: journey.operatorId,
          vehicleId: journey.vehicleId,
          direction: journey.direction,
          journeyType: journey.journeyType,
          uniqueVehicleId: journey.uniqueVehicleId,
          speed: speed,
        };
      });
    });
    const selectedJourneyId = getJourneyId(selectedJourney);
    const selectJourney = useCallback(
      (journey) => {
        if (journey && journey.journeyType === "journey") {
          const journeyId = `${date}_${journey.departureTime}_${journey.routeId}_${journey.direction}_${journey.uniqueVehicleId}`;
          if (journeyId && selectedJourneyId !== journeyId) {
            journey.departureDate = date;
            Journey.setSelectedJourney(journey);
            const time = get(journey, "recordedTime");
            if (time) {
              Time.setTime(time);
            }
          } else {
            Journey.setSelectedJourney(null);
          }
        }
      },
      [selectedJourneyId]
    );
    const headerText = {
      fi: `${text("filterpanel.speed_search_text_1")} ${speedFilter} Km/h ${text(
        "filterpanel.speed_search_text_2"
      )}`,
      se: `${text("filterpanel.speed_search_text_1")} ${speedFilter} Km/h`,
      en: `${text("filterpanel.speed_search_text_1")} ${speedFilter} Km/h`,
    };
    vehiclepositions.sort((a, b) => b.speed - a.speed);
    const copyToClipboard = () => {
      const headers = [
        "pvm",
        "Km/h",
        text("map.stops.depart"),
        `${text("domain.route")}`,
        text("vehicle.identifier_short"),
        text("sidepanel.tabs.timestamp"),
      ];

      const dataRows = vehiclepositions.map((vehicleposition) => {
        const {
          departureTime,
          routeId,
          speed,
          recordedTime,
          direction,
          vehicleId,
        } = vehicleposition;
        const formattedSpeed = `${speed}`.replace(".", ",");
        const routeDirection = `${routeId}/${direction}`;
        return [
          `${date}`,
          formattedSpeed,
          departureTime,
          routeDirection,
          vehicleId,
          recordedTime,
        ];
      });

      const clipboardContent = [headers, ...dataRows]
        .map((row) => row.join("\t"))
        .join("\n");

      navigator.clipboard
        .writeText(clipboardContent)
        .then(() => {
          console.log("Data copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy data to clipboard:", err);
        });
    };
    return (
      <SidepanelList
        testIdPrefix="journeys-by-week"
        loading={loading}
        disableScrollOffset={true}
        header={
          <ListHeader>
            <HeaderContainer>
              <HeaderText>
                {headerText[language] ? `${headerText[language]}` : `${headerText["en"]}`}
              </HeaderText>
              <Tooltip helpText={text("sidepanel.tabs.copy_to_clipboard")}>
                <CopyButton onClick={copyToClipboard}>
                  <ClipBoard width="1.5rem" height="1.5rem" fill="white" />
                </CopyButton>
              </Tooltip>
            </HeaderContainer>
          </ListHeader>
        }
        floatingListHeader={
          <TableHeader>
            <Tooltip helpText={text("sidepanel.tabs.speed")}>
              <TableCell>Km/h</TableCell>
            </Tooltip>
            <Tooltip helpText={text("sidepanel.tabs.departure")}>
              <TableCell>{text("map.stops.depart")}</TableCell>
            </Tooltip>
            <Tooltip helpText={text("sidepanel.tabs.selected_route_dir")}>
              <TableCell>{text("domain.route")}</TableCell>
            </Tooltip>
            <Tooltip helpText={text("sidepanel.tabs.vehicle_number")}>
              <TableCell>{text("vehicle.identifier_short")}</TableCell>
            </Tooltip>
            <Tooltip helpText={text("sidepanel.tabs.timestamp_description")}>
              <TableCell>{text("sidepanel.tabs.timestamp")}</TableCell>
            </Tooltip>
          </TableHeader>
        }>
        {(scrollRef) =>
          (!areaSpeeds || areaSpeeds.length === 0) && !loading ? (
            <EmptyView text="message.emptyview.noareevents" />
          ) : (
            <ListWrapper>
              <TableBody>
                {vehiclepositions.map((vehicleposition, index) => {
                  const {
                    departureTime,
                    routeId,
                    speed,
                    recordedTime,
                    direction,
                    vehicleId,
                    uniqueVehicleId,
                  } = vehicleposition;
                  const journeyId = `${date}_${departureTime}_${routeId}_${direction}_${uniqueVehicleId}`;
                  const isSelected = journeyId === selectedJourneyId;
                  const formattedSpeed = `${speed}`.replace(".", ",");
                  return (
                    <TableRow
                      data-testid={``}
                      ref={scrollRef}
                      key={`area_event_row_${departureTime}_${routeId}_${speed}_${recordedTime}_${index}`}
                      selected={isSelected}
                      onClick={() => selectJourney(vehicleposition)}>
                      <Tooltip helpText={text("sidepanel.tabs.speed")}>
                        <TableCell>{formattedSpeed}</TableCell>
                      </Tooltip>
                      <Tooltip helpText={text("sidepanel.tabs.departure")}>
                        <TableCell>{departureTime}</TableCell>
                      </Tooltip>
                      <Tooltip helpText={text("sidepanel.tabs.selected_route_dir")}>
                        <TableCell>{`${routeId}/${direction}`}</TableCell>
                      </Tooltip>
                      <Tooltip helpText={text("sidepanel.tabs.vehicle_number")}>
                        <TableCell>{vehicleId}</TableCell>
                      </Tooltip>
                      <Tooltip helpText={text("sidepanel.tabs.timestamp_description")}>
                        <TableCell>{recordedTime}</TableCell>
                      </Tooltip>
                    </TableRow>
                  );
                })}
              </TableBody>
            </ListWrapper>
          )
        }
      </SidepanelList>
    );
  }
);

export default SpeedAreaJourneyList;
