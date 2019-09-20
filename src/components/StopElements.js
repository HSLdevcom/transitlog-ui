import styled from "styled-components";
import React from "react";
import {TagButton} from "./TagButton";
import TimingStop from "../icons/TimingStop";
import omit from "lodash/omit";

export const SmallText = styled.span`
  display: block;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  color: var(--light-grey);
`;

export const StopMarker = styled.button`
  border-radius: 50%;
  flex: 0 0 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border: 3px solid ${({color = "var(--blue)"}) => color};
  outline: 0;
  padding: 0;
  cursor: pointer;
`;

const TimingStopMarkerBackground = styled(StopMarker)`
  border: 0;
  width: 1.75rem;
  height: 1.75rem;
  margin-top: -0.3rem;
`;

const TimingStopMarkerIcon = styled(TimingStop).attrs(({color}) => ({fill: color}))`
  width: 100%;
  height: 100%;
  display: block;
`;

export const TimingStopMarker = (props) => (
  <TimingStopMarkerBackground className={props.className}>
    <TimingStopMarkerIcon {...omit(props, "className")} />
  </TimingStopMarkerBackground>
);

export const StopElementsWrapper = styled.div`
  display: flex;
  align-self: stretch;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 3px;
  background: ${({color = "var(--blue)"}) => color};
  margin: 0 calc(0.75rem - 1.5px);

  &:after {
    content: "";
    display: ${({terminus}) => (terminus === "destination" ? "block" : "none")};
    height: 3px;
    width: 1.5rem;
    background: ${({color = "var(--blue)"}) => color};
    margin-top: auto;
  }
`;
export const StopWrapper = styled.div`
  padding: 0 1rem 0 0;
  margin-left: 0.5rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
`;
export const StopContent = styled.div`
  padding: 0 1rem 1.5rem 0.75rem;
  width: 100%;
`;

export const StopHeading = styled.button`
  margin: 0.2rem 0 0;
  color: var(--dark-grey);
  font-size: 0.875rem;
  font-weight: normal;
  font-family: var(--font-family);
  background: transparent;
  border: 0;
  padding: 0;
  outline: 0;
  text-align: left;
  cursor: pointer;
`;
export const TimeHeading = styled.div`
  font-size: 0.75rem;
  color: var(--light-grey);
  margin-bottom: 0.2rem;
  margin-top: 1rem;
  font-family: var(--font-family);
`;
export const StopArrivalTime = styled(TagButton)`
  margin: 0 0 0.5rem;
`;
export const StopDepartureTime = styled(TagButton)``;
