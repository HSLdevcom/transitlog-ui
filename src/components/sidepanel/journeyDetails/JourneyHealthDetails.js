import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import {Heading} from "../../Typography";
import {HealthChecklistValues} from "../../../hooks/useJourneyHealth";
import Alert from "../../../icons/Alert";
import ToggleView from "../../ToggleView";
import ArrowDown from "../../../icons/ArrowDown";
import Info from "../../../icons/Info";
import {text, Text} from "../../../helpers/text";

const JourneyHealthContainer = styled.div``;

const HealthRow = styled.div`
  display: flex;
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  background: transparent;
  font-family: inherit;
  align-items: baseline;
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
  margin-right: 0.5rem;
  flex: 1 1 auto;
`;

const ObservedValue = styled.span`
  flex: 0 1 auto;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  line-height: 1;
  padding: 4px 0.5rem;
  background: ${({backgroundColor = "var(--lighter-grey)"}) => backgroundColor};
  color: ${({color = "var(--dark-grey)"}) => color};
  margin-left: auto;
  font-family: "Courier New", Courier, monospace;
  border-color: transparent;
`;

const ToggleIcon = styled(ArrowDown)`
  margin-left: 0.5rem;
  align-self: center;
  transition: transform 0.1s ease-out;
  ${(p) => (p.isOpen ? `transform: rotate(180deg);` : "")}
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

const Accordion = styled(ToggleView)`
  &:nth-child(even) {
    button {
      background: rgba(0, 0, 0, 0.03);
    }
  }

  button {
    text-decoration: none;
    color: inherit;
    width: 100%;
    display: block;
  }
`;

const MessagesContainer = styled.div`
  padding: 1rem 1rem 0.5rem;
`;

const HealthMessage = styled.div`
  font-size: 0.875rem;
  margin: 0 0 0.75rem;
  padding: 0 0 0.75rem;
  border-bottom: 1px solid var(--lighter-grey);
  display: flex;
  align-items: baseline;
  justify-content: flex-start;

  &:last-child {
    border-bottom: 0;
    margin-bottom: 0;
  }

  > *:first-child {
    margin-right: 0.5rem;
    position: relative;
    top: 4px;
    margin-top: -4px;
    flex-shrink: 0;
  }
`;

const HealthItem = observer((props) => {
  const {messages, name, status, health, color} = props;

  let showValue = text("journey.health.unknown");

  if (typeof status !== "undefined") {
    showValue = text(`journey.health.${status}`);
  } else if (typeof health !== "undefined") {
    showValue = health === -1 ? text(`journey.health.pending`) : `${health}%`;
  }

  return (
    <Accordion
      key={name}
      disabled={messages.length === 0}
      label={(isOpen) => (
        <HealthRow>
          <LineHeading>{text(`journey.health.${name}`)}</LineHeading>
          <ObservedValue
            color={color !== "var(--yellow)" ? "white" : "var(--dark-grey)"}
            backgroundColor={color}>
            {showValue}
          </ObservedValue>
          <ToggleIcon
            isOpen={isOpen}
            fill={messages.length !== 0 ? "var(--grey)" : "transparent"}
            height="0.875rem"
            width="0.875rem"
          />
        </HealthRow>
      )}>
      {messages.length !== 0 && (
        <MessagesContainer>
          {messages.map((message, idx) => (
            <HealthMessage key={`message-${idx}`}>
              <Info fill="var(--light-blue)" height="1.25rem" width="1.25rem" />
              <span>{message}</span>
            </HealthMessage>
          ))}
        </MessagesContainer>
      )}
    </Accordion>
  );
});

const JourneyHealthDetails = observer(({journeyHealth}) => {
  const healthColor = useCallback((value) =>
    value === -1
      ? "var(--light-grey)"
      : value >= 97
      ? "var(--green)"
      : value >= 75
      ? "var(--yellow)"
      : "var(--red)"
  );

  const totalHealthColor = healthColor(journeyHealth.total);

  return (
    <JourneyHealthContainer>
      <TotalHealthDisplay>
        {journeyHealth.total === 0 ? (
          <>
            <HealthAlert />
            <LineHeading>
              <Text>journey.health.data_missing</Text>
            </LineHeading>
          </>
        ) : (
          <>
            <TotalHealthIndicator
              color={totalHealthColor}
              value={Math.floor(journeyHealth.total)}
            />
            <div>
              <Heading style={{marginBottom: 0}} color="var(--grey)" level={2}>
                {journeyHealth.total}%
              </Heading>
              {!journeyHealth.isDone && (
                <LineHeading>
                  <Text>journey.health.not_complete</Text>
                </LineHeading>
              )}
            </div>
          </>
        )}
      </TotalHealthDisplay>
      <div>
        {Object.entries(journeyHealth.checklist).map(([name, {status, messages}]) => {
          const currentHealthColor =
            status === HealthChecklistValues.PENDING
              ? "var(--light-grey)"
              : status === HealthChecklistValues.FAILED
              ? "var(--red)"
              : "var(--green)";

          return (
            <HealthItem
              name={name}
              status={status}
              messages={messages}
              color={currentHealthColor}
            />
          );
        })}
        {Object.entries(journeyHealth.health).map(([name, {health, messages}]) => {
          const currentHealthColor = healthColor(health);

          return (
            <HealthItem
              name={name}
              health={health}
              messages={messages}
              color={currentHealthColor}
            />
          );
        })}
      </div>
    </JourneyHealthContainer>
  );
});

export default JourneyHealthDetails;
