import React from "react";
import styled from "styled-components";
import JourneyDetailsHeader from "./JourneyDetailsHeader";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import get from "lodash/get";
import JourneyEvents from "./JourneyEvents";
import {LoadingDisplay} from "../../Loading";
import JourneyInfo from "./JourneyInfo";
import {transportColor} from "../../transportModes";
import Tabs from "../Tabs";
import AlertsList from "../../AlertsList";
import {getAlertsInEffect} from "../../../helpers/getAlertsInEffect";
import {text} from "../../../helpers/text";
import CancellationsList from "../../CancellationsList";

const JourneyPanelWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  align-items: stretch;
  position: relative;
`;

const ListWrapper = styled.div``;

const ScrollContainer = styled.div`
  height: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
`;

const JourneyPanelContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  width: 100%;
`;

@inject(app("UI", "Time", "Filters"))
@observer
class JourneyDetails extends React.Component {
  render() {
    const {
      state: {date, timeMoment},
      journey = null,
      route = null,
      loading = false,
    } = this.props;

    const journeyMode = get(route, "mode", "BUS");
    const journeyColor = get(transportColor, journeyMode, "var(--light-grey)");
    const originDeparture = get(journey, "departure", null);
    const journeyEvents = get(journey, "events", []);

    const journeyTime = originDeparture
      ? get(originDeparture, "observedDepartureTime.departureDateTime", timeMoment)
      : timeMoment;

    const alerts = getAlertsInEffect(
      get(journey, "alerts", []).length !== 0 ? journey : route,
      journeyTime
    );

    const cancellations = get(journey, "cancellations", get(route, "cancellations", []));

    return (
      <JourneyPanelWrapper data-testid="journey-details">
        <LoadingDisplay loading={loading} />
        <JourneyDetailsHeader journey={journey} route={route} />
        <ScrollContainer>
          <JourneyPanelContent>
            <JourneyInfo date={date} journey={journey} />
            <Tabs suggestedTab="journey-events">
              {journeyEvents.length !== 0 && (
                <JourneyEvents
                  cancellations={cancellations}
                  loading={loading}
                  name="journey-events"
                  label={text("journey.events")}
                  events={journeyEvents}
                  originDeparture={journey.departure}
                  date={journey.departureDate}
                  color={journeyColor}
                />
              )}
              {(alerts.length !== 0 || cancellations.length !== 0) && (
                <ListWrapper name="journey-alerts" label={text("domain.alerts")}>
                  {alerts.length !== 0 && (
                    <AlertsList showListHeading={true} alerts={alerts} />
                  )}
                  {cancellations.length !== 0 && (
                    <CancellationsList
                      cancellations={cancellations}
                      showListHeading={true}
                    />
                  )}
                </ListWrapper>
              )}
            </Tabs>
          </JourneyPanelContent>
        </ScrollContainer>
      </JourneyPanelWrapper>
    );
  }
}
export default JourneyDetails;
