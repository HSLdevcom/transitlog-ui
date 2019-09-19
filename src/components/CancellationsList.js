import React from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {getCancellationKey} from "../helpers/getAlertKey";
import CancellationItem from "./CancellationItem";
import {ListHeading} from "./commonComponents";
import groupBy from "lodash/groupBy";
import {Text} from "../helpers/text";
import Tooltip from "./Tooltip";

const CancellationsListWrapper = styled.div`
  padding-bottom: 1rem;
  overflow-x: hidden;
`;

const decorate = flow(observer);

const CancellationsList = decorate(
  ({className, cancellations = [], showListHeading = false, helpText}) => {
    const validCancellations =
      cancellations && Array.isArray(cancellations) ? cancellations : [];

    const cancellationGroups = groupBy(
      validCancellations,
      ({departureDate, journeyStartTime}) => departureDate + journeyStartTime
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
        {Object.values(cancellationGroups).map((cancellationGroup) => {
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
        })}
      </CancellationsListWrapper>
    );
  }
);

export default CancellationsList;
