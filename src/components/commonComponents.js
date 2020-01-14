import {Heading} from "./Typography";
import styled, {css} from "styled-components";

export const ListHeading = styled(Heading).attrs(() => ({level: 5}))`
  padding: 0 0 0.5rem 1rem;
  margin: 1rem 0 0 !important;
  border-bottom: 1px solid var(--alt-grey);
  font-weight: normal;
  text-transform: uppercase;
`;

export const cancelledStyle = css`
  ${({isCancelled = false}) =>
    isCancelled
      ? css`
          &:after {
            content: "";
            position: absolute;
            pointer-events: none;
            height: 2px;
            background: var(--red);
            top: 45%;
            left: 0.5rem;
            right: 0.5rem;
          }
        `
      : ""}
`;
