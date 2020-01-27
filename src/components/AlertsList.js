import React, {useMemo} from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import groupBy from "lodash/groupBy";
import partition from "lodash/partition";
import {observer} from "mobx-react-lite";
import AlertItem from "./AlertItem";
import {getAlertKey} from "../helpers/getAlertKey";
import {ListHeading} from "./commonComponents";
import {Text, text} from "../helpers/text";
import Tooltip from "./Tooltip";
import Checkmark from "../icons/Checkmark";
import EmptyView from "./EmptyView";
import {orderAlerts} from "../helpers/getAlertsInEffect";
import {inject} from "../helpers/inject";

const AlertsListWrapper = styled.div`
  padding-bottom: 1rem;
  overflow-x: hidden;
`;

const decorate = flow(observer, inject("state"));

const AlertsList = decorate(
  ({
    className,
    alerts = [],
    error,
    showEmptyMessage = false,
    showListHeading = false,
    helpText,
    state,
  }) => {
    const validAlerts = alerts && Array.isArray(alerts) ? alerts : [];

    // Debounce time value to only update when the date updates. This is only
    // used for sorting, so it doesn't need the absolute newest value.
    const sortTime = useMemo(() => state.timeMoment.toDate(), [state.date]);

    // Separate alerts that can be grouped
    const [groupableAlerts, ungroupableAlerts] = partition(
      validAlerts,
      (alert) => typeof alert.bulletinId !== "undefined" && alert.bulletinId !== "unknown"
    );

    let groupedAlerts = validAlerts;

    if (groupableAlerts.length !== 0) {
      groupedAlerts = Object.values(groupBy(groupableAlerts, "bulletinId"))
        .map((alertGroup) => {
          const representative = alertGroup[0];
          const allAffectedIds = alertGroup.map((alert) => alert.affectedId);

          return {
            ...representative,
            affectedIds: allAffectedIds,
            affectedId: allAffectedIds[0],
          };
        })
        .concat(ungroupableAlerts);

      groupedAlerts = orderAlerts(groupedAlerts, sortTime);
    }

    return (
      <AlertsListWrapper className={className}>
        {showListHeading && (
          <Tooltip helpText={helpText || "Alerts heading"}>
            <ListHeading>
              <Text>domain.alerts.subset</Text>
            </ListHeading>
          </Tooltip>
        )}
        {validAlerts.length === 0 && showEmptyMessage ? (
          <EmptyView
            icon={Checkmark}
            error={error}
            text={text("message.emptyview.noalerts")}
          />
        ) : (
          groupedAlerts.map((alert) => (
            <AlertItem key={getAlertKey(alert)} alert={alert} />
          ))
        )}
      </AlertsListWrapper>
    );
  }
);

export default AlertsList;
