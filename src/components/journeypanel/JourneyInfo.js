import React from "react";
import styled from "styled-components";
import get from "lodash/get";
import flow from "lodash/flow";
import findLast from "lodash/findLast";
import CalculateTerminalTime from "./CalculateTerminalTime";
import doubleDigit from "../../helpers/doubleDigit";
import {getEquipmentType, validateEquipment} from "./equipmentType";
import {Text, text} from "../../helpers/text";
import {getOperatorName} from "../../helpers/getOperatorNameById";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";

const JourneyInfo = styled.div`
  flex: none;
  border-bottom: 1px solid var(--alt-grey);
`;

const JourneyInfoRow = styled.div`
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
  color: #888888;
  font-size: 0.9rem;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

const Values = styled.div`
  font-size: ${({small = false}) => (small ? "0.75rem" : "0.9rem")};
  color: var(--dark-grey);
  margin-left: auto;
  display: flex;
  justify-content: flex-start;
  align-items: baseline;

  > * {
    white-space: nowrap;
    flex-wrap: nowrap;
    border-radius: 4px;
    line-height: 1;
    padding: 4px 0.5rem;
    border: 1px solid var(--lighter-grey);
    margin-left: 0.5rem;
  }
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

const decorate = flow(observer, inject("state"));

export default decorate(({departure, state, journey, date}) => {
  if (!departure) {
    return null;
  }

  const isLoggedIn = !!state.user;

  const equipmentCode = get(departure, "equipmentType", "");
  const equipmentType = getEquipmentType(equipmentCode);
  const plannedColor = get(departure, "equipmentColor", "");
  const operatorName = getOperatorName(departure.operatorId);
  const observedOperatorName = getOperatorName(journey.operatorId);
  const operatingUnit = get(departure, "operatingUnit", null);

  const originArrivalEvent = journey.events.find((evt) => evt.type === "ARS");
  const destinationArrivalEvent = findLast(journey.events, (evt) => evt.type === "ARS");

  const terminalTime = get(departure, "terminalTime", null);
  const recoveryTime = get(departure, "recoveryTime", null);

  return (
    <JourneyInfo>
      {terminalTime !== null && (
        <JourneyInfoRow>
          <Line>
            <LineHeading>
              <Text>journey.terminal_time</Text>
            </LineHeading>
            <Values>
              <span>{terminalTime} min</span>
              {originArrivalEvent && (
                <CalculateTerminalTime
                  date={date}
                  departure={departure}
                  event={originArrivalEvent}>
                  {({diffMinutes, diffSeconds, sign, wasLate}) => (
                    <ObservedValue
                      color={wasLate ? "white" : "var(--dark-grey)"}
                      backgroundColor={wasLate ? "var(--red)" : "var(--lighter-grey)"}>
                      {sign === "-" ? "-" : ""}
                      {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                    </ObservedValue>
                  )}
                </CalculateTerminalTime>
              )}
            </Values>
          </Line>
        </JourneyInfoRow>
      )}
      {recoveryTime !== null && (
        <JourneyInfoRow>
          <Line>
            <LineHeading>
              <Text>journey.recovery_time</Text>
            </LineHeading>
            <Values>
              <span>{get(departure, "recoveryTime", 0)} min</span>
              {destinationArrivalEvent && (
                <CalculateTerminalTime
                  recovery={true}
                  date={date}
                  departure={departure}
                  event={destinationArrivalEvent}>
                  {({diffMinutes, diffSeconds, wasLate, sign}) => (
                    <ObservedValue
                      color={wasLate ? "white" : "var(--dark-grey)"}
                      backgroundColor={wasLate ? "var(--red)" : "var(--lighter-grey)"}>
                      {sign === "-" ? "-" : ""}
                      {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                    </ObservedValue>
                  )}
                </CalculateTerminalTime>
              )}
            </Values>
          </Line>
        </JourneyInfoRow>
      )}
      {isLoggedIn && journey.uniqueVehicleId && (
        <JourneyInfoRow>
          <Line>
            <LineHeading>
              <Text>vehicle.identifier</Text>
            </LineHeading>
            <Values>
              <span>{journey.uniqueVehicleId}</span>
            </Values>
          </Line>
        </JourneyInfoRow>
      )}
      <JourneyInfoRow>
        <Line>
          <LineHeading>
            <Text>vehicle.operator</Text>
          </LineHeading>
          <Values small>
            <span>{operatorName}</span>
          </Values>
        </Line>
        {observedOperatorName && observedOperatorName !== operatorName && (
          <Line>
            <LineHeading>
              <Text>vehicle.subcontractor</Text>
            </LineHeading>
            <Values small>
              <ObservedValue>{observedOperatorName}</ObservedValue>
            </Values>
          </Line>
        )}
      </JourneyInfoRow>
      {!!operatingUnit && (
        <JourneyInfoRow>
          <Line>
            <LineHeading>
              <Text>journey.operating_unit</Text>
            </LineHeading>
            <Values>
              <span>{operatingUnit}</span>
            </Values>
          </Line>
        </JourneyInfoRow>
      )}
      {journey.equipment && (
        <>
          <JourneyInfoRow>
            <Line>
              <LineHeading>
                <Text>vehicle.registry_nr</Text>
              </LineHeading>
              <Values>
                <span>{journey.equipment.registryNr}</span>
              </Values>
            </Line>
          </JourneyInfoRow>
          <JourneyInfoRow>
            <Line>
              <LineHeading>
                <Text>vehicle.age</Text>
              </LineHeading>
              <Values>
                <span>{journey.equipment.age}</span>
                &nbsp;
                <Text>
                  {journey.equipment.age === 1 ? "general.year" : "general.year.plural"}
                </Text>
              </Values>
            </Line>
          </JourneyInfoRow>
        </>
      )}
      <JourneyInfoRow>
        <Line>
          <LineHeading>
            <Text>journey.requested_equipment</Text>
          </LineHeading>
          <Values>
            <span>
              {equipmentType
                ? equipmentType
                : equipmentCode
                ? equipmentCode
                : text("general.no_type")}
            </span>
            {plannedColor && <span>{plannedColor}</span>}
          </Values>
        </Line>
        {!!journey.equipment && (
          <Line right>
            <Values>
              {validateEquipment(departure, journey.equipment).map((prop) => {
                const propVal = prop.observed;
                let propValShort = propVal.slice(0, 11).trim();

                if (propValShort < propVal) {
                  propValShort += ".";
                }

                return (
                  prop.observed && (
                    <ObservedValue
                      key={`equipment_prop_${prop.name}`}
                      backgroundColor={prop.color}
                      color={prop.required !== false ? "white" : "var(--dark-grey)"}>
                      {propValShort}
                    </ObservedValue>
                  )
                );
              })}
            </Values>
          </Line>
        )}
      </JourneyInfoRow>
    </JourneyInfo>
  );
});
