import React, {useCallback, useMemo} from "react";
import {observer} from "mobx-react-lite";
import SidepanelList from "./SidepanelList";
import styled from "styled-components";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import EmptyView from "../EmptyView";
import {text} from "../../helpers/text";
import Tooltip from "../Tooltip";

const ListHeader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 5px;
  font-size: 1rem;
`;

const ListWrapper = styled.div``;

const TableRow = styled.div`
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--lightest-grey);
  flex-wrap: nowrap;
  background-color: #f6fcff;
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

const TableHeader = styled(TableRow)`
  font-weight: bold;
  border-bottom-width: 1px;
  border-color: var(--alt-grey);

  ${TableCell} {
    border-color: var(--alt-grey);
  }
`;

const decorate = flow(observer, inject("Journey", "Time", "UI"));

const SpeedAreaJourneyList = decorate(
  ({areaSpeeds, loading, state: {language, speedFilter}}) => {
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
          speed: speed,
        };
      });
    });
    const headerText = {
      fi: `${text("filterpanel.speed_search_text_1")} ${speedFilter} Km/h ${text(
        "filterpanel.speed_search_text_2"
      )}`,
      se: `${text("filterpanel.speed_search_text_1")} ${speedFilter} Km/h`,
      en: `${text("filterpanel.speed_search_text_1")} ${speedFilter} Km/h`,
    };
    vehiclepositions.sort((a, b) => b.speed - a.speed);
    return (
      <SidepanelList
        testIdPrefix="journeys-by-week"
        loading={loading}
        disableScrollOffset={true}
        header={
          <ListHeader>
            {headerText[language] ? `${headerText[language]}` : `${headerText["en"]}`}
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
                  } = vehicleposition;

                  return (
                    <TableRow
                      data-testid={``}
                      ref={scrollRef}
                      key={`area_event_row_${departureTime}_${routeId}_${speed}_${recordedTime}_${index}`}
                      selected={false}>
                      <Tooltip helpText={text("sidepanel.tabs.speed")}>
                        <TableCell>{speed}</TableCell>
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
