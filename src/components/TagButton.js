import styled from "styled-components";
import {LocBadge} from "./commonComponents";

export const ColoredSlot = styled.span`
  padding: 3px 3px 3px 5px;
  background-color: transparent;
  color: ${({color}) => color};
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  font-weight: bold;
  justify-content: flex-start;
  margin-right: 0.25rem;
  min-width: 5.25rem;
  font-size: 0.875rem;

  svg {
    width: 1rem;
    height: 1rem;
    margin-right: 2px;
    margin-top: -1px;
  }
`;

export const ColoredBackgroundSlot = styled.span`
  font-size: 0.875rem;
  font-family: "Courier New", Courier, monospace;
  border-radius: 4px;
  line-height: 1rem;
  padding: 4px 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({backgroundColor}) => backgroundColor};
  color: ${({color}) => color};
  transform: translate(1px, -2px);
  margin-bottom: -4px;
  margin-left: auto;
  margin-right: auto;
  min-width: 5rem;

  &:empty {
    display: none;
  }
`;

export const PlainSlot = styled.span`
  padding: 3px 5px 3px 2px;
  border-left: 1px solid var(--lighter-grey);
  min-width: 6rem;
  font-weight: normal;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: left;
  font-size: 0.875rem;
  hyphens: auto;
  margin-right: auto;

  &:first-child {
    border-left: 0;
  }
`;

export const PlainSlotMono = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-left: 0;
  font-weight: normal;
  min-width: 6rem;
  padding: 3px 5px;
  font-size: 0.875rem;
  margin-left: auto;
  font-family: "Courier New", Courier, monospace;
`;

export const TagButton = styled.button`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-end;
  border-radius: 4px;
  border: 1px solid ${({selected}) => (selected ? "var(--blue)" : "var(--lighter-grey)")};
  background: #fefefe;
  outline: 0;
  width: 100%;
  max-width: 100%;
  font-family: var(--font-family);
  font-size: 1rem;
  padding: 0;
  cursor: pointer;
  
  /* Apply styles on LocBadge only when inside a TagButton. */
  ${ColoredBackgroundSlot} + ${LocBadge} {
    margin-left: 5px;
    margin-right: -7px;
  }
`;
