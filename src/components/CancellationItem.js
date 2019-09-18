import React from "react";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";
import styled from "styled-components";
import {Heading} from "./Typography";
import ToggleView from "./ToggleView";
import {observer} from "mobx-react-lite";
import {text, Text, alertText} from "../helpers/text";
import format from "date-fns/format";
import CrossThick from "../icons/CrossThick";
import Checkmark2 from "../icons/Checkmark2";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";

const CancellationComponent = styled.div`
  font-family: var(--font-family);
  background: transparent;
  color: var(--dark-grey);
  border-bottom: 1px solid var(--lightest-grey);

  &:first-child {
    margin-top: 0;
  }

  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.03);
  }
`;

const ChildWrapper = styled.div`
  background: white;
  margin-bottom: 0.5rem;
  margin-left: 1rem;
  border-top: 1px solid var(--alt-grey);
  border-left: 1px solid var(--alt-grey);
  border-bottom: 1px solid var(--alt-grey);

  ${CancellationComponent}:last-child {
    border-bottom: 0;
  }
`;

const ChildHeading = styled(Heading).attrs({level: 6})`
  margin-left: 1rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: normal;
`;

const CancellationHeader = styled.div`
  width: 100%;
  padding: 0.75rem 1rem;

  svg {
    display: block;
    margin-right: 0.75rem;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CancellationType = styled.span`
  margin-right: 1rem;
  flex: 1 1 auto;

  svg {
    display: inline-block;
    margin-right: 0.5rem;
  }
`;

const CancellationContent = styled.div`
  width: 100%;
  padding: 0 1rem 0.75rem;
`;

const CancellationTime = styled.div`
  text-align: right;
  margin-left: auto;

  svg {
    margin: 0 1rem;
  }

  strong {
    font-size: 0.8rem;
    font-weight: bold;
  }

  span {
    font-size: 0.7rem;
  }
`;

const CancellationTitle = styled(Heading).attrs({level: 5})`
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  font-weight: bold;
  color: inherit;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CancellationDescription = styled.div`
  margin: 0 0 1rem;
  font-size: 0.875rem;
`;

const CancellationInfo = styled.div`
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
`;

const CancellationInfoRow = styled.div`
  padding: 0.5rem 0 0;
`;

const CancellationPublishTime = styled.span`
  font-size: 0.75rem;
  color: var(--grey);
`;

const CancellationFooter = styled.div`
  padding-top: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const Accordion = styled(ToggleView)`
  button {
    text-decoration: none;
    color: inherit;
    width: 100%;
    display: block;
  }
`;

const decorate = flow(
  observer,
  inject("state")
);

const CancellationItem = decorate(
  ({
    cancellation,
    small = false,
    children,
    className,
    noIcon = false,
    timestampInHeader = false,
    state,
  }) => {
    const publishedMoment = moment.tz(cancellation.lastModifiedDateTime, TIMEZONE);
    const Icon = cancellation.isCancelled ? CrossThick : Checkmark2;

    return (
      <CancellationComponent className={className}>
        <Accordion
          label={
            <CancellationHeader>
              <Row>
                {!noIcon && (
                  <Icon
                    width="1rem"
                    fill={cancellation.isCancelled ? "var(--red)" : "var(--green)"}
                  />
                )}
                {timestampInHeader ? (
                  <CancellationType>
                    {publishedMoment.format("DD/MM")} {publishedMoment.format("HH:mm")}
                  </CancellationType>
                ) : (
                  <CancellationType>
                    {cancellation.routeId}/{cancellation.direction}
                  </CancellationType>
                )}
                <CancellationTime>
                  <span>{format(cancellation.departureDate, "DD/MM")} </span>
                  <strong>{cancellation.journeyStartTime}</strong>
                </CancellationTime>
              </Row>
              {!small && cancellation.title && cancellation.title.trim() !== "-" && (
                <CancellationTitle>{cancellation.title}</CancellationTitle>
              )}
            </CancellationHeader>
          }>
          <CancellationContent>
            {small && cancellation.title && cancellation.title.trim() !== "-" && (
              <CancellationTitle>{cancellation.title}</CancellationTitle>
            )}
            {cancellation.description && cancellation.description.trim() !== "-" && (
              <CancellationDescription>
                {cancellation.description}
              </CancellationDescription>
            )}
            <CancellationInfo>
              {cancellation.category !== "HIDDEN" && (
                <>
                  <CancellationInfoRow>
                    {text("general.category")}:{" "}
                    <strong>{alertText(cancellation.category, state.language)}</strong>
                  </CancellationInfoRow>
                  <CancellationInfoRow>
                    {text("general.subcategory")}:{" "}
                    <strong>{alertText(cancellation.subCategory, state.language)}</strong>
                  </CancellationInfoRow>
                </>
              )}
              <CancellationInfoRow>
                {text("general.impact")}:{" "}
                <strong>
                  {alertText(cancellation.cancellationEffect, state.language)}
                </strong>
              </CancellationInfoRow>
            </CancellationInfo>
            <CancellationFooter>
              {timestampInHeader ? (
                <CancellationPublishTime>
                  {cancellation.routeId}/{cancellation.direction}
                </CancellationPublishTime>
              ) : (
                <CancellationPublishTime>
                  {publishedMoment.format("DD/MM")} {publishedMoment.format("HH:mm")}
                </CancellationPublishTime>
              )}
            </CancellationFooter>
          </CancellationContent>
        </Accordion>
        {children && (
          <>
            <ChildHeading>
              <Text>general.previous.plural</Text>
            </ChildHeading>
            <ChildWrapper>{children}</ChildWrapper>
          </>
        )}
      </CancellationComponent>
    );
  }
);

export default CancellationItem;
