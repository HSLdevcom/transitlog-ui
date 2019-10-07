import React from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import AlertItem from "./AlertItem";
import {getAlertKey} from "../helpers/getAlertKey";
import {ListHeading} from "./commonComponents";
import {Text, text} from "../helpers/text";
import Tooltip from "./Tooltip";
import Checkmark from "../icons/Checkmark";
import EmptyView from "./EmptyView";

const AlertsListWrapper = styled.div`
  padding-bottom: 1rem;
  overflow-x: hidden;
`;

const decorate = flow(observer);

const AlertsList = decorate(
  ({
    className,
    alerts = [],
    error,
    showEmptyMessage = false,
    showListHeading = false,
    helpText,
  }) => {
    const validAlerts = alerts && Array.isArray(alerts) ? alerts : [];

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
          validAlerts.map((alert) => <AlertItem key={getAlertKey(alert)} alert={alert} />)
        )}
      </AlertsListWrapper>
    );
  }
);

export default AlertsList;
