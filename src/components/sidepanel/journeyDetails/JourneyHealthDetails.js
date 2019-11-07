import React from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";

const JourneyHealthContainer = styled.div``;

const HealthDescription = styled.p`
  font-size: 0.875rem;
  padding: 0 1rem;
`;

const HealthRow = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  padding: 0.5rem 1rem;
  background: transparent;
  font-size: 1rem;
  font-family: inherit;

  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.03);
  }
`;

const Line = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  line-height: 1.5;
  justify-content: ${({right = false}) => (right ? "flex-end" : "space-between")};
  font-size: ${({small = false}) => (small ? "0.75rem" : "0.9rem")};
  color: var(--dark-grey);

  + * {
    margin-top: 0.35rem;
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

const JourneyHealthDetails = observer(({journeyHealth}) => {
  return (
    <JourneyHealthContainer>
      <HealthDescription>
        This view shows you to what degree the selected journey is covered by the data.
        Use the information to determine the reliability of the data that you're viewing.
      </HealthDescription>
      {Object.entries(journeyHealth.health).map(([name, value]) => (
        <HealthRow>
          <Line>
            <LineHeading>{name}</LineHeading>
            <ObservedValue
              color={value < 75 || value > 90 ? "white" : "var(--dark-grey)"}
              backgroundColor={
                value > 90 ? "var(--green)" : value >= 75 ? "var(--yellow)" : "var(--red)"
              }>
              {value}%
            </ObservedValue>
          </Line>
        </HealthRow>
      ))}
    </JourneyHealthContainer>
  );
});

export default JourneyHealthDetails;
