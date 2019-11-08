import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import {Heading} from "../../Typography";
import {HealthChecklistValues} from "../../../hooks/useJourneyHealth";
import Alert from "../../../icons/Alert";

const JourneyHealthContainer = styled.div``;

const HealthRow = styled.div`
  display: flex;
  width: 100%;
  padding: 0.5rem 1rem;
  background: transparent;
  font-size: 1rem;
  font-family: inherit;
  align-items: center;
  line-height: 1.5;
  justify-content: space-between;
  color: var(--dark-grey);

  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.03);
  }
`;

const LineHeading = styled.span`
  color: var(--dark-grey);
  font-size: 0.9rem;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

const ObservedValue = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  line-height: 1;
  padding: 4px 0.5rem;
  background: ${({backgroundColor = "var(--lighter-grey)"}) => backgroundColor};
  color: ${({color = "var(--dark-grey)"}) => color};
  margin-left: 0.5rem;
  font-family: "Courier New", Courier, monospace;
  border-color: transparent;
`;

const TotalHealthDisplay = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
`;

const TotalHealthIndicator = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: conic-gradient(
    ${(p) => p.color} 0 ${(p) => p.value}%,
    var(--lightest-grey) 0 ${(p) => 100 - p.value}%
  );
  position: relative;
  margin-right: 1rem;

  &:after {
    content: "";
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    position: absolute;
    background: white;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const HealthAlert = styled(Alert).attrs({
  width: "2.1rem",
  height: "2.1rem",
  fill: "var(--red)",
})`
  margin-right: 1rem;
  flex-shrink: 0;
`;

const JourneyHealthDetails = observer(({journeyHealth}) => {
  const healthColor = useCallback((value) =>
    value > 90 ? "var(--green)" : value >= 75 ? "var(--yellow)" : "var(--red)"
  );

  const totalHealthColor = healthColor(journeyHealth.total);

  return (
    <JourneyHealthContainer>
      <TotalHealthDisplay>
        {journeyHealth.total === 0 ? (
          <>
            <HealthAlert />
            <span>One or more aspect of the journey data is missing.</span>
          </>
        ) : (
          <>
            <TotalHealthIndicator
              color={totalHealthColor}
              value={Math.floor(journeyHealth.total)}
            />
            <Heading color="var(--grey)" level={2}>
              {journeyHealth.total}%
            </Heading>
          </>
        )}
      </TotalHealthDisplay>
      <div>
        {Object.entries(journeyHealth.checklist).map(([name, state]) => {
          const currentHealthColor =
            state === HealthChecklistValues.PENDING
              ? "var(--light-grey)"
              : state === HealthChecklistValues.FAILED
              ? "var(--red)"
              : "var(--green)";

          return (
            <HealthRow key={name}>
              <LineHeading>{name}</LineHeading>
              <ObservedValue color="white" backgroundColor={currentHealthColor}>
                {state}
              </ObservedValue>
            </HealthRow>
          );
        })}
        {Object.entries(journeyHealth.health).map(([name, {health: value, messages}]) => {
          const currentHealthColor = healthColor(value);

          return (
            <HealthRow key={name}>
              <LineHeading>{name}</LineHeading>
              <ObservedValue
                color={
                  currentHealthColor !== "var(--yellow)" ? "white" : "var(--dark-grey)"
                }
                backgroundColor={currentHealthColor}>
                {value}%
              </ObservedValue>
            </HealthRow>
          );
        })}
      </div>
    </JourneyHealthContainer>
  );
});

export default JourneyHealthDetails;
