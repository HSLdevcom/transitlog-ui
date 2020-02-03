import {getAlertKey} from "../helpers/getAlertKey";
import Website from "../icons/Website";
import React from "react";
import {getAlertStyle} from "../helpers/getAlertStyle";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";
import styled from "styled-components";
import {Heading} from "./Typography";
import ToggleView from "./ToggleView";
import {observer} from "mobx-react-lite";
import {AlertDistribution} from "../helpers/getAlertsInEffect";
import BusStop from "../icons/BusStop";
import JourneyPlanner from "../icons/JourneyPlanner";
import HSLLogoNoText from "../icons/HSLLogoNoText";
import {text, alertText, Text} from "../helpers/text";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";

const AlertComponent = styled.div`
  font-family: var(--font-family);
  background: ${({color}) => (color ? color : "transparent")};
  color: ${({lightText}) => (lightText ? "white" : "var(--dark-grey)")};

  &:first-child {
    margin-top: 0;
  }

  &:nth-child(even) {
    background: ${({color}) => (color ? color : "rgba(0, 0, 0, 0.03)")};
  }
`;

const AlertHeader = styled.div`
  width: 100%;
  padding: 0.75rem 1rem;

  svg {
    display: block;
    margin-right: 0.75rem;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: ${({baseline = false}) => (baseline ? "baseline" : "flex-start")};
  justify-content: flex-start;
  flex-wrap: nowrap;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertType = styled.span`
  margin-right: 1rem;
  flex: 1 1 auto;
  white-space: nowrap;

  svg {
    display: inline-block;
    margin-right: 1rem;
  }
`;

const AlertContent = styled.div`
  width: 100%;
  padding: 0 1rem 0.75rem;
`;

const AlertTime = styled.div`
  text-align: right;
  margin-left: auto;
  white-space: nowrap;

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

const AlertIconStyle = styled.svg`
  flex: none;
  margin-left: -0.25rem;
`;

const AlertTitle = styled(Heading).attrs(() => ({level: 5}))`
  margin: 0;
  font-size: 0.875rem;
  font-weight: bold;
  color: inherit;
  flex: 1 1 auto;
`;

const AlertDescription = styled.div`
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: inherit;
`;

const AlertInfo = styled.div`
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
`;

const AlertInfoRow = styled.div`
  padding: 0.5rem 0 0;
`;

const AlertPublishTime = styled.span`
  font-size: 0.75rem;
  margin-left: auto;
  color: ${({lightText}) => (lightText ? "white" : "var(--grey)")};
`;

const AlertFooter = styled.div`
  padding-top: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const AlertLink = styled.a``;

const Accordion = styled(ToggleView)`
  button {
    text-decoration: none;
    color: inherit;
    width: 100%;
    display: block;
  }
`;

const AffectedIdsDisplay = styled.div`
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.025);
  border-radius: 5px;
  border: 1px solid var(--lighter-grey);
  line-height: 1.35;
`;

const AlertTimeDisplay = observer(({alert}) => {
  const startMoment = moment.tz(alert.startDateTime, TIMEZONE);
  const endMoment = moment.tz(alert.endDateTime, TIMEZONE);

  const startDate = startMoment.format("DD/MM");
  const endDate = endMoment.format("DD/MM");
  const startTime = startMoment.format("HH:mm");
  const endTime = endMoment.format("HH:mm");

  return (
    <AlertTime>
      {startDate === endDate ? (
        <>
          <span>{startDate} </span>
          <strong>
            {startTime} - {endTime}
          </strong>
        </>
      ) : (
        <>
          <span>{startDate} </span>
          <strong>{startTime} </strong>- <span>{endDate} </span>
          <strong>{endTime}</strong>
        </>
      )}
    </AlertTime>
  );
});

const decorate = flow(observer, inject("state"));

const AlertItem = decorate(({alert, state}) => {
  const {Icon, color} = getAlertStyle(alert);

  const AlertIcon = AlertIconStyle.withComponent(Icon);
  const publishedMoment = moment.tz(
    alert.lastModifiedDateTime || alert.publishedDateTime,
    TIMEZONE
  );

  let TypeIcon = HSLLogoNoText;
  let type = "network";

  if (
    [AlertDistribution.AllRoutes, AlertDistribution.Route].includes(alert.distribution)
  ) {
    TypeIcon = JourneyPlanner;
    type = "route";
  }

  if ([AlertDistribution.AllStops, AlertDistribution.Stop].includes(alert.distribution)) {
    TypeIcon = BusStop;
    type = "stop";
  }

  const colorful = type === "network";
  const lightBg = (colorful && !color.includes("red")) || !colorful;

  const validUrl =
    typeof alert.url.startsWith !== "undefined"
      ? alert.url.startsWith("http")
        ? alert.url
        : "https://" + alert.url
      : "";

  const affectedCount = alert.affectedIds.length;
  const affectedTitle =
    affectedCount > 1
      ? `${affectedCount} ${text("general.subjects.count")}`
      : alert.affectedId;

  return (
    <AlertComponent
      lightText={!lightBg}
      color={colorful ? color : undefined}
      key={getAlertKey(alert)}>
      <Accordion
        label={
          <AlertHeader>
            <Row baseline>
              <AlertType>
                <TypeIcon fill={!lightBg ? "white" : "var(--dark-grey)"} width="1rem" />
                {alert.distribution === AlertDistribution.AllRoutes
                  ? text("domain.alerts.all_routes")
                  : alert.distribution === AlertDistribution.AllStops
                  ? text("domain.alerts.all_stops")
                  : alert.distribution === AlertDistribution.Route ||
                    alert.distribution === AlertDistribution.Stop
                  ? affectedTitle
                  : text("domain.alerts.network")}
              </AlertType>
              <AlertTimeDisplay alert={alert} />
            </Row>
            <Row>
              <AlertIcon
                width="1.5rem"
                height="1.5rem"
                fill={
                  colorful && !lightBg ? "white" : colorful ? "var(--dark-grey)" : color
                }
              />
              <AlertTitle>{alert.title}</AlertTitle>
            </Row>
          </AlertHeader>
        }>
        <AlertContent>
          {affectedCount > 1 && (
            <AffectedIdsDisplay>
              <span
                style={{display: "block", marginBottom: "0.5rem", fontWeight: "bold"}}>
                <Text>general.subjects</Text>
              </span>
              <span
                style={{fontFamily: '"Courier New", Courier, monospace'}}
                dangerouslySetInnerHTML={{__html: alert.affectedIds.join("<br />")}}
              />
            </AffectedIdsDisplay>
          )}
          {alert.description && (
            <AlertDescription lightBg={colorful && lightBg}>
              {alert.description}
            </AlertDescription>
          )}
          <AlertInfo>
            <AlertInfoRow>
              {text("general.category")}:{" "}
              <strong>{alertText("category." + alert.category, state.language)}</strong>
            </AlertInfoRow>
            <AlertInfoRow>
              {text("general.impact")}:{" "}
              <strong>{alertText("alertImpact." + alert.impact, state.language)}</strong>
            </AlertInfoRow>
          </AlertInfo>
          <AlertFooter lightBg={colorful && lightBg}>
            {validUrl && (
              <AlertLink target="_blank" href={validUrl}>
                <Website width="1.25rem" fill={lightBg ? "var(--grey)" : "white"} />
              </AlertLink>
            )}
            <AlertPublishTime lightText={!lightBg}>
              <span>
                {publishedMoment.format("DD/MM")}, {publishedMoment.format("HH:mm")}
              </span>
            </AlertPublishTime>
          </AlertFooter>
        </AlertContent>
      </Accordion>
    </AlertComponent>
  );
});

export default AlertItem;
