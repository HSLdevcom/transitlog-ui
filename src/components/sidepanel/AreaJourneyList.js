import React, {useCallback, useMemo} from "react";
import {observer} from "mobx-react-lite";
import SidepanelList from "./SidepanelList";
import styled from "styled-components";
import getJourneyId from "../../helpers/getJourneyId";
import ToggleButton from "../ToggleButton";
import {areaEventsStyles} from "../../stores/UIStore";
import {text} from "../../helpers/text";
import {getNormalTime} from "../../helpers/time";
import Input from "../Input";
import flow from "lodash/flow";
import get from "lodash/get";
import {inject} from "../../helpers/inject";
import {Button} from "../Forms";
import EmptyView from "../EmptyView";

const JourneyListRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({selected = false}) =>
    selected ? "var(--blue)" : "rgba(0, 0, 0, 0.025)"};
  padding: 0.75rem 1rem;
  border: 0;
  max-width: none;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  color: ${({selected = false}) => (selected ? "white" : "var(--grey)")};
  outline: none;

  &:nth-child(odd) {
    background: ${({selected = false}) =>
      selected ? "var(--blue)" : "rgba(255, 255, 255, 0.025)"};
  }
`;

const JourneyRowLeft = styled.span`
  display: block;
  font-weight: bold;
  min-width: 6rem;
  text-align: left;
`;

const TimeSlot = styled.span`
  font-size: 0.857rem;
  font-family: "Courier New", Courier, monospace;
  min-width: 5rem;
  text-align: right;
`;

const ListHeader = styled.div`
  width: 100%;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  width: 100%;
`;

const TimetableFilters = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-end;
`;

// Wrap in styled() to use in a style rule.
const RouteFilterInput = styled(Input)``;

const RouteFilterContainer = styled.div`
  width: auto;
  margin-right: 1rem;

  label {
    font-size: 0.75rem;
  }

  ${RouteFilterInput} input {
    background-color: ${({noResult = false}) =>
      noResult ? "rgba(255,100,100, 0.15)" : "white"};
  }
`;

const ApplyButton = styled(Button).attrs({small: true, primary: true})`
  margin-left: 0.5rem;
  margin-bottom: 1px;
`;

const decorate = flow(
  observer,
  inject("Journey", "Time", "UI")
);

const AreaJourneyList = decorate(
  ({
    journeys,
    loading,
    Journey,
    UI,
    Time,
    state: {selectedJourney, areaEventsStyle, areaEventsRouteFilter},
  }) => {
    const selectedJourneyId = getJourneyId(selectedJourney);

    const selectJourney = useCallback(
      (journey) => {
        // Select the journey if truthy and not unsigned.
        if (journey && journey.journeyType === "journey") {
          const journeyId = getJourneyId(journey);

          // Only set these if the journey is truthy and was not already selected
          if (journeyId && selectedJourneyId !== journeyId) {
            Journey.setSelectedJourney(journey);
          } else {
            Journey.setSelectedJourney(null);
          }
          // If unsigned, just set the time to the start of the vehiclePositions.
        } else if (journey.journeyType !== "journey") {
          const time = get(journey, "vehiclePositions[0].recordedTime");

          if (time) {
            Time.setTime(time);
          }
        }
      },
      [selectedJourneyId]
    );

    const onChangeDisplayStyle = useCallback((e) => {
      const value = e.target.value;

      UI.setAreaEventsStyle(
        value === areaEventsStyles.MARKERS
          ? areaEventsStyles.POLYLINES
          : areaEventsStyles.MARKERS
      );
    }, []);

    const onChangeAreaEventsFilter = useCallback((e) => {
      const value = get(e, "target.value", "");
      UI.setAreaEventsRouteFilter(value);
    }, []);

    const filteringNoResults = useMemo(
      () => !!areaEventsRouteFilter && journeys.length === 0,
      [areaEventsRouteFilter, journeys.length]
    );

    return (
      <SidepanelList
        testIdPrefix="area-journeys"
        focusKey={selectedJourneyId}
        loading={loading}
        header={
          <ListHeader>
            <HeaderRow>
              <ToggleButton
                type="checkbox"
                onChange={onChangeDisplayStyle}
                name="area_events_style"
                isSwitch={true}
                preLabel={text("sidepanel.area_events.show_lines")}
                label={text("sidepanel.area_events.show_markers")}
                checked={areaEventsStyle === areaEventsStyles.MARKERS}
                value={areaEventsStyle}
              />
            </HeaderRow>
            <HeaderRow>
              <TimetableFilters>
                <RouteFilterContainer noResult={filteringNoResults}>
                  <RouteFilterInput
                    value={areaEventsRouteFilter}
                    animatedLabel={false}
                    onChange={onChangeAreaEventsFilter}
                    label={text("domain.route")}
                  />
                </RouteFilterContainer>
                <ApplyButton onClick={() => onChangeAreaEventsFilter("")}>
                  {text("general.clear")}
                </ApplyButton>
              </TimetableFilters>
            </HeaderRow>
          </ListHeader>
        }>
        {(scrollRef) =>
          (!journeys || journeys.length === 0) && !loading ? (
            <EmptyView text="message.emptyview.noareevents" />
          ) : (
            journeys.map((journey) => {
              const {routeId, direction, departureTime} = journey;
              const journeyId = getJourneyId(journey);

              const journeyIsSelected =
                selectedJourney && selectedJourneyId === journeyId;

              const isJourney = journey.journeyType === "journey";

              const subject = !isJourney
                ? journey.uniqueVehicleId
                : `${routeId}/${direction}`;

              return (
                <JourneyListRow
                  data-testid={`area-journey-item-${journey.journeyType} area-journey-item-${subject}`}
                  ref={journeyIsSelected ? scrollRef : null}
                  key={`area_event_row_${journeyId}`}
                  selected={journeyIsSelected}
                  onClick={() => selectJourney(journey)}>
                  <JourneyRowLeft>
                    {!isJourney ? (
                      <>
                        {text(`journey.type.${journey.journeyType}`)}: {subject}
                      </>
                    ) : (
                      subject
                    )}
                  </JourneyRowLeft>
                  {departureTime && <TimeSlot>{getNormalTime(departureTime)}</TimeSlot>}
                </JourneyListRow>
              );
            })
          )
        }
      </SidepanelList>
    );
  }
);

export default AreaJourneyList;
