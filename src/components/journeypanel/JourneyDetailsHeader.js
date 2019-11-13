import {Heading} from "../Typography";
import {TransportIcon} from "../transportModes";
import React from "react";
import styled from "styled-components";
import Calendar from "../../icons/Calendar";
import JourneyPlanner from "../../icons/JourneyPlanner";
import Time2 from "../../icons/Time2";
import {observer} from "mobx-react-lite";
import {parseLineNumber} from "../../helpers/parseLineNumber";
import CrossThick from "../../icons/CrossThick";
import {Text} from "../../helpers/text";
import Alert from "../../icons/Alert";
import {Button} from "../Forms";

const JourneyPanelHeader = styled.div`
  flex: none;
  border-bottom: 1px solid var(--lighter-grey);
  width: 100%;

  svg {
    margin-left: -0.2rem;
    margin-right: 0.5rem;
  }
`;

const HeaderContent = styled.div`
  padding: 1rem;

  > * {
    display: flex;
    align-items: flex-end;
  }

  > *:first-child {
    margin-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }
`;

const LineIdHeading = styled.span`
  font-weight: bold;
  margin: 0;
`;

const LineNameHeading = styled(Heading).attrs({level: 4})`
  font-weight: normal;
  margin: 0;
`;

const MainHeaderRow = styled(Heading).attrs({level: 3})`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 1rem;
`;

const HeaderText = styled.span`
  font-weight: normal;
  margin-left: 1.25rem;
  display: inline-flex;
  align-items: flex-start;
  font-size: 0.875rem;
  padding-bottom: 0.2rem;
  overflow: visible;

  &:first-child {
    margin-left: 0;
  }

  svg {
    margin-left: 0;
  }
`;

const DateTimeHeading = styled.div`
  margin-bottom: 0.75rem;
`;

const CancelledAlert = styled.div`
  background: var(--red);
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;

  svg {
    margin-right: 1rem;
    display: block;
    margin-left: 0;
  }
`;

const HealthIndicator = styled.button`
  cursor: pointer;
  outline: 0;
  user-select: none;
  border: 0;
  width: auto;
  font-family: var(--font-family);
  font-weight: bold;
  padding: 5px 7px;
  font-size: 0.75rem;
  border-radius: 5px;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => (p.value <= 75 || p.value >= 97 ? "white" : "var(--dark-grey)")};
  background: ${(p) =>
    p.value >= 97 ? "var(--green)" : p.value >= 75 ? "var(--yellow)" : "var(--red)"};
`;

const HealthAlert = styled(Alert).attrs({
  width: "1.5rem",
  height: "1.5rem",
  fill: "var(--red)",
})`
  flex-shrink: 0;
`;

export default observer(
  ({journeyHealth, route, journey, showVehicleId = false, selectTab}) => {
    if (!journey && !route) {
      return null;
    }

    const {uniqueVehicleId, departureTime, departureDate, isCancelled} = journey || {};
    const {mode, routeId, origin, destination} = route || {};
    const routeName = [origin, destination].join(" - ");

    return (
      <JourneyPanelHeader data-testid="journey-details-header">
        <HeaderContent>
          <MainHeaderRow>
            <TransportIcon width={23} height={23} mode={mode} />
            <LineIdHeading>{parseLineNumber(routeId)}</LineIdHeading>
            <HeaderText>
              <JourneyPlanner fill="var(--blue)" width="1rem" height="1rem" />
              {routeId}
            </HeaderText>
            {showVehicleId && uniqueVehicleId && (
              <HeaderText>
                <TransportIcon mode={mode} width={17} height={17} />
                {uniqueVehicleId}
              </HeaderText>
            )}
            {journeyHealth &&
              (journeyHealth.total > 0 ? (
                <HealthIndicator
                  onClick={() => selectTab("journey-health")}
                  title="Journey health"
                  value={journeyHealth.total}>
                  {Math.floor(journeyHealth.total)}%
                </HealthIndicator>
              ) : (
                <Button
                  transparent={true}
                  onClick={() => selectTab("journey-health")}
                  style={{
                    marginLeft: "auto",
                    height: "auto",
                    border: 0,
                    background: "transparent",
                    padding: 0,
                    width: "auto",
                  }}
                  title="Journey health">
                  <HealthAlert />
                </Button>
              ))}
          </MainHeaderRow>
          {departureDate && departureTime && (
            <>
              <DateTimeHeading>
                <HeaderText>
                  <Calendar fill="var(--blue)" width="1rem" height="1rem" />
                  {departureDate}
                </HeaderText>
                <HeaderText>
                  <Time2 fill="var(--blue)" width="1rem" height="1rem" />
                  {departureTime}
                </HeaderText>
              </DateTimeHeading>
            </>
          )}
          <LineNameHeading>{routeName}</LineNameHeading>
        </HeaderContent>
        {isCancelled && (
          <CancelledAlert>
            <CrossThick fill="white" width="0.75rem" height="0.75rem" />
            <Text>domain.cancelled</Text>
          </CancelledAlert>
        )}
      </JourneyPanelHeader>
    );
  }
);
