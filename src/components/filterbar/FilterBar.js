import React, {Component, useRef} from "react";
import DateSettings from "./DateSettings";
import TimeSettings from "./TimeSettings";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import TimeSlider from "./TimeSlider";
import AdditionalTimeSettings from "./AdditionalTimeSettings";
import RouteSettings from "./RouteSettings";
import FilterSection from "./FilterSection";
import Header from "./Header";
import VehicleSettings from "./VehicleSettings";
import StopSettings from "./StopSettings";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";

const SiteHeader = styled(Header)`
  flex: 0 0 auto;
  z-index: 1;
  width: 100%;
`;

const FilterBarWrapper = styled.div`
  background: var(--lightest-grey);
  color: var(--dark-grey);
  border-bottom: 1px solid var(--alt-grey);
  overflow: visible;
  display: flex;
  flex: none;
  flex-direction: column;
  position: relative;
`;

const FilterBarGrid = styled.div`
  display: grid;
  grid-template-columns: 22rem repeat(3, 1fr);
  height: auto;
  width: 100%;
`;

const BottomSlider = styled(TimeSlider)`
  position: relative;
  margin-top: 0;
  width: 100%;
  z-index: 10;
`;

const CalendarRoot = styled.div`
  position: absolute;
  z-index: 100;
  top: 4.25rem;
  margin-left: 2.5rem;
`;

const decorate = flow(
  observer,
  inject("state")
);

const FilterBar = decorate(
  ({className, journeys = [], unsignedEventsLoading, routeEventsLoading, state}) => {
    const calendarRootRef = useRef(null);
    const user = state.user;

    return (
      <FilterBarWrapper className={className}>
        <SiteHeader />
        <FilterBarGrid>
          <FilterSection scrollable={true} style={{paddingBottom: "0.5rem"}}>
            <DateSettings calendarRootRef={calendarRootRef} />
            <TimeSettings journeys={journeys} />
            <AdditionalTimeSettings />
          </FilterSection>
          {/*
            The datepicker calendar needs to be outside the scrollable filtersection.
            The CalendarRoot is the mount point for the calendar portal.
           */}
          <CalendarRoot ref={calendarRootRef} />
          <FilterSection>
            <RouteSettings routeEventsLoading={routeEventsLoading} />
          </FilterSection>
          {user && (
            <FilterSection>
              <VehicleSettings unsignedEventsLoading={unsignedEventsLoading} />
            </FilterSection>
          )}
          <FilterSection>
            <StopSettings />
          </FilterSection>
        </FilterBarGrid>
        <BottomSlider journeys={journeys} />
      </FilterBarWrapper>
    );
  }
);

export default FilterBar;
