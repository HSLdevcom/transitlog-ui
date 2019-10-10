import React from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";

const SectionContent = styled.div`
  width: 100%;
  padding: 0.75rem 1rem 1rem;
`;

const FilterSectionWrapper = styled.div`
  width: 100%;
  height: 7.75rem;
  border-right: 1px solid var(--lighter-grey);
  background: var(--lightest-grey);
  position: relative;
  ${({scrollable = false}) =>
    scrollable ? `overflow-y: auto; overflow-x: hidden;` : "overflow: visible;"};
`;

const FilterSection = observer(({className, children, scrollable, style}) => (
  <FilterSectionWrapper scrollable={scrollable} className={className}>
    <SectionContent style={style}>{children}</SectionContent>
  </FilterSectionWrapper>
));

export default FilterSection;
