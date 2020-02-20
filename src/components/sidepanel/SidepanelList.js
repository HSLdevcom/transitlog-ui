import React, {useRef, useState, useEffect, useCallback} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import {LoadingDisplay} from "../Loading";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";

const ListWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: ${({hasHeader}) => (hasHeader ? "auto 1fr" : "1fr")};
`;

const ListRows = styled.div`
  position: relative;
  height: 100%;
  overflow-y: scroll;
`;

const ListContainer = styled.div`
  position: relative;
  height: 100%;
`;

const ListHeader = styled.header`
  display: flex;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  font-size: 0.9em;
  border-bottom: 1px solid var(--alt-grey);
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.075);
  position: relative;
  z-index: 1;
  line-height: 1.4;
  flex-wrap: nowrap;
  align-items: start;
  padding: 0.75rem 1rem;
  color: var(--grey);
`;

const FloatingListHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  padding-right: 7px;
`;

// Needs an absolutely positioned container for scrollbars to work in Chrome...
const ScrollContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
`;

const decorate = flow(observer, inject("state"));

const SidepanelList = decorate(
  ({
    state: {live},
    focusKey,
    header,
    floatingListHeader,
    children = () => {},
    loading = false,
    testIdPrefix = "sidepanel",
  }) => {
    const scrollElementRef = useRef(null);
    const scrollPositionRef = useRef(null);
    const listHeight = useRef(0);
    const updateScrollOffsetTimer = useRef(0);

    useEffect(() => {
      // Set the height of the list on mount
      if (scrollElementRef.current) {
        listHeight.current = scrollElementRef.current.getBoundingClientRect().height;
      }
    }, []);

    const updateScrollOffset = useCallback(() => {
      if (scrollElementRef.current && scrollPositionRef.current) {
        const nextOffset = scrollPositionRef.current.offsetTop;
        const currentOffset = scrollElementRef.current.scrollTop;

        if (nextOffset && nextOffset !== currentOffset) {
          scrollElementRef.current.scrollTop = nextOffset - listHeight.current / 2;
        }
      }
    }, [listHeight.current, scrollElementRef.current, scrollPositionRef.current]);

    useEffect(() => {
      if (!loading) {
        // Update the scroll offset 100 ms after any update.
        // There must be a timer here otherwise the list may not be rendered
        // before the scroll offset is read.
        updateScrollOffsetTimer.current = setTimeout(() => {
          updateScrollOffset();
        }, 100);
      }

      return () => {
        clearTimeout(updateScrollOffsetTimer.current);
        updateScrollOffsetTimer.current = 0;
      };
    }, [focusKey, loading]);

    return (
      <ListWrapper hasHeader={!!header} data-testid={`${testIdPrefix}-list`}>
        {header && <ListHeader>{header}</ListHeader>}
        <ListContainer>
          {floatingListHeader && (
            <FloatingListHeader>{floatingListHeader}</FloatingListHeader>
          )}
          <ListRows ref={scrollElementRef}>
            <ScrollContainer>
              {children(scrollPositionRef, updateScrollOffset)}
            </ScrollContainer>
          </ListRows>
          {!live && <LoadingDisplay loading={loading} />}
        </ListContainer>
      </ListWrapper>
    );
  }
);

export default SidepanelList;
