import styled from "styled-components";
import React from "react";

export const P = styled.p`
  margin: 1rem 0;
`;

export const Heading = styled(({level = 1, ...rest}) =>
  React.createElement(`h${level}`, rest)
)`
  margin: 1rem 0;
  font-family: var(--font-family);
  color: ${({color = "var(--dark-grey)"}) => color};

  &:first-child {
    margin-top: 0;
  }
`;
