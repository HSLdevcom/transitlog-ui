import React from "react";
import styled from "styled-components";
import get from "lodash/get";
import Equipment from "./Equipment";
import CalculateTerminalTime from "./CalculateTerminalTime";
import doubleDigit from "../../../helpers/doubleDigit";
import {getEquipmentType} from "./equipmentType";
import {Text, text} from "../../../helpers/text";
import {getOperatorName} from "../../../helpers/getOperatorNameById";

const JourneyInfo = styled.div`
  flex: none;
`;

const JourneyInfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--lightest-grey);
  font-size: 1rem;
  font-family: inherit;

  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.0075);
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
  color: var(--light-grey);
  font-size: 1rem;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

const Values = styled.div`
  font-size: ${({small = false}) => (small ? "0.75rem" : "0.9rem")};
  color: var(--dark-grey);
  margin-left: auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  > * {
    white-space: nowrap;
    flex-wrap: nowrap;
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
`;

export default ({
  journey,
  departure,
  date,
  originStopTimes,
  destinationStopTimes,
}) => {
  if (!departure) {
    return null;
  }

  const equipmentCode = get(departure, "equipmentType", "");
  const equipmentType = getEquipmentType(equipmentCode);
  const operatorName = getOperatorName(departure.operatorId);
  const observedOperatorName = getOperatorName(journey.owner_operator_id);

  return (
    <JourneyInfo>
      <JourneyInfoRow>
        <Line>
          <LineHeading>Operator</LineHeading>
          <Values small>
            <span>{operatorName}</span>
          </Values>
        </Line>
        {observedOperatorName !== operatorName && (
          <Line>
            <LineHeading>Subcontractor</LineHeading>
            <Values small>
              <ObservedValue>{observedOperatorName}</ObservedValue>
            </Values>
          </Line>
        )}
      </JourneyInfoRow>
      <JourneyInfoRow>
        <Line>
          <LineHeading>
            <Text>journey.terminal_time</Text>
          </LineHeading>
          <Values>
            <span>{get(departure, "terminalTime", 0)} min</span>
            {originStopTimes && (
              <CalculateTerminalTime
                date={date}
                departure={originStopTimes.departure}
                event={originStopTimes.arrivalEvent}>
                {({diffMinutes, diffSeconds, sign, wasLate}) => (
                  <ObservedValue
                    color={wasLate ? "white" : "var(--dark-grey)"}
                    backgroundColor={wasLate ? "var(--red)" : "var(--lighter-grey)"}>
                    {sign === "+" ? "-" : ""}
                    {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                  </ObservedValue>
                )}
              </CalculateTerminalTime>
            )}
          </Values>
        </Line>
      </JourneyInfoRow>
      <JourneyInfoRow>
        <Line>
          <LineHeading>
            <Text>journey.recovery_time</Text>
          </LineHeading>
          <Values>
            <span>{get(departure, "recoveryTime", 0)} min</span>
            {destinationStopTimes && (
              <CalculateTerminalTime
                recovery={true}
                date={date}
                departure={destinationStopTimes.departure}
                event={destinationStopTimes.arrivalEvent}>
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
              {get(departure, "trunkColorRequired", 0) === 1 && ", HSL-orans"}
            </span>
          </Values>
        </Line>
        <Equipment journey={journey} departure={departure}>
          {({equipment = []}) =>
            equipment.length && (
              <Line right>
                <Values>
                  {equipment.map((prop) => (
                    <ObservedValue
                      key={`equipment_prop_${prop.name}`}
                      backgroundColor={prop.color}
                      color={prop.required !== false ? "white" : "var(--dark-grey)"}>
                      {prop.observed}
                    </ObservedValue>
                  ))}
                </Values>
              </Line>
            )
          }
        </Equipment>
      </JourneyInfoRow>
    </JourneyInfo>
  );
};
