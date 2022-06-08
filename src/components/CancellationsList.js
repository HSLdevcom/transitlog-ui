import React from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {getCancellationKey} from "../helpers/getAlertKey";
import CancellationItem from "./CancellationItem";
import {ListHeading} from "./commonComponents";
import groupBy from "lodash/groupBy";
import {Text, text} from "../helpers/text";
import Tooltip from "./Tooltip";
import Checkmark from "../icons/Checkmark";
import EmptyView from "./EmptyView";

const CancellationsListWrapper = styled.div`
  padding-bottom: 1rem;
  overflow-x: hidden;
`;

const decorate = flow(observer);

const CancellationsList = decorate(
  ({
    className,
    cancellations = [],
    error,
    showEmptyMessage = false,
    showListHeading = false,
    helpText,
  }) => {
    const validCancellations =
      cancellations && Array.isArray(cancellations) ? cancellations : [];
    const filteredCancellations = validCancellations.filter((c) => {
      if (
        c.cancellationType === "CANCEL_DEPARTURE" ||
        c.cancellationType === "CANCEL_ENTIRE_DEPARTURE"
      ) {
        return c;
      }
    });
    const cancellationGroups = groupBy(
      filteredCancellations,
      ({departureDate, journeyStartTime, routeId, direction}) =>
        departureDate + journeyStartTime + routeId + direction
    );

    return (
      <CancellationsListWrapper className={className}>
        {showListHeading && (
          <Tooltip helpText={helpText || "Cancellations heading"}>
            <ListHeading>
              <Text>domain.cancellations</Text>
            </ListHeading>
          </Tooltip>
        )}
        {cancellations.length === 0 && showEmptyMessage ? (
          <EmptyView
            icon={Checkmark}
            error={error}
            text={text("message.emptyview.nocancellations")}
          />
        ) : (
          Object.values(cancellationGroups).map((cancellationGroup) => {
            const firstCancellation = cancellationGroup[0];

            if (cancellationGroup.length === 1) {
              return (
                <CancellationItem
                  key={getCancellationKey(firstCancellation)}
                  cancellation={firstCancellation}
                />
              );
            }

            return (
              <CancellationItem
                key={getCancellationKey(firstCancellation)}
                cancellation={firstCancellation}>
                {cancellationGroup.slice(1).map((cancellation) => (
                  <CancellationItem
                    small={true}
                    key={getCancellationKey(cancellation)}
                    cancellation={cancellation}
                  />
                ))}
              </CancellationItem>
            );
          })
        )}
      </CancellationsListWrapper>
    );
  }
);

export default CancellationsList;
