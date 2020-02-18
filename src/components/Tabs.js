import React, {Children, useState, useCallback, useEffect, useRef, useMemo} from "react";
import {observer} from "mobx-react-lite";
import styled, {keyframes} from "styled-components";
import compact from "lodash/compact";
import difference from "lodash/difference";
import flow from "lodash/flow";
import {setUrlValue, getUrlValue} from "../stores/UrlManager";
import Tooltip from "./Tooltip";

const TabsWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  position: relative;
  z-index: 1;
  max-width: 100%;
`;

const TabButtonsWrapper = styled.div`
  background-color: white;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
`;

const TabButton = styled.button`
  font-family: inherit;
  font-size: ${({fontSizeMultiplier = 1}) => `calc(0.45rem * ${fontSizeMultiplier})`};
  text-transform: uppercase;
  background-color: ${({selected}) => (selected ? "white" : "var(--lightest-grey)")};
  border: 1px solid var(--alt-grey);
  border-top: 0;
  border-left: 0;
  border-bottom-color: ${({selected}) =>
    selected ? "transparent" : "var(--lighter-grey)"};
  display: flex;
  flex: 1 1 auto;
  width: auto;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: 0;
  padding: 0.7rem 3px;
  position: relative;
  overflow: hidden;

  &:last-child {
    border-right: 0;
  }

  &:only-child {
    padding-bottom: 0.5rem;
  }
`;

const TabContentWrapper = styled.div`
  background: white;
  height: 100%;
`;

const progress = keyframes`
  from {
    transform: translateX(-100%);
  }
  
  to {
    transform: translateX(100%);
  }
`;

const LoadingIndicator = styled.div`
  animation: ${progress} 0.75s linear infinite;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  background-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 0) 20%,
    var(--lighter-green) 50%,
    rgba(0, 0, 0, 0) 80%
  );
  z-index: 0;
`;

const TabLabel = styled.span`
  position: relative;
  white-space: nowrap;
`;

const decorate = flow(observer);

/**
 * This component can be driven either by props (selectedTab and onTabChange) or
 * dynamically with internal state and "suggested" tabs. Use either. In dynamic
 * mode, newly added tabs will be selected automatically.
 */

const Tabs = decorate(
  ({
    testIdPrefix = "sidebar",
    selectedTab,
    urlValue = "tab",
    onTabChange,
    children,
    suggestedTab,
    className,
  }) => {
    const isControlled = typeof onTabChange === "function";

    const [internalSelectedTab, setInternalSelectedTab] = useState(
      getUrlValue(urlValue, selectedTab || suggestedTab || "")
    );

    const currentSelectedTab = useMemo(() => {
      if (selectedTab && !isControlled) {
        console.warn(
          `Selected tab passed to Tabs (${urlValue}) without change handler. Using internal tab state.`
        );
      }

      return (isControlled ? selectedTab : internalSelectedTab) || internalSelectedTab;
    }, [internalSelectedTab, selectedTab, isControlled]);

    const prevTabs = useRef([]);

    const selectTab = useCallback(
      (nextSelectedTab) => {
        setInternalSelectedTab(nextSelectedTab);
        setUrlValue(urlValue, nextSelectedTab);

        if (isControlled) {
          onTabChange(nextSelectedTab);
        }
      },
      [currentSelectedTab, onTabChange]
    );

    // Select the that that is selected by props
    useEffect(() => {
      if (isControlled && selectedTab && selectedTab !== currentSelectedTab) {
        selectTab(selectedTab);
      }
    }, [selectedTab, currentSelectedTab, isControlled]);

    // The children usually contain an empty string as the first element.
    // Compact() removes all such falsy values from the array.
    const validChildren = useMemo(() => compact(Children.toArray(children)), [children]);

    // An array of child tab data with labels etc is extracted from props.children.
    let tabs = useMemo(() => {
      const childrenTabs = validChildren.map((tabContent) => {
        if (!tabContent || !React.isValidElement(tabContent)) {
          return null;
        }

        const {name, label, loading, helpText = ""} = tabContent.props;
        return {name, label, content: tabContent, helpText, loading};
      });

      return compact(childrenTabs);
    }, [validChildren]);

    // Function to auto-select any newly added tab or the suggested tab
    const selectAddedTab = useCallback(() => {
      let prevTabNames = [];

      if (prevTabs.current) {
        prevTabNames = prevTabs.current.map(({name}) => name);
      }

      prevTabs.current = tabs;

      const tabNames = tabs.map(({name}) => name);
      const newTabs = difference(tabNames, prevTabNames);

      if (newTabs.length === 0) {
        return false;
      }

      // By default, auto-select the first newly added tab if
      // the tabs don't already contain the suggested tab.
      let nextTab =
        !isControlled || !tabNames.includes(currentSelectedTab)
          ? newTabs[0]
          : currentSelectedTab;

      // If the new tabs contain the suggested tab, select that.
      if (newTabs.includes(suggestedTab)) {
        nextTab = suggestedTab;
      }

      if (nextTab && nextTab !== currentSelectedTab) {
        selectTab(nextTab);
        return true;
      }

      return false;
    }, [currentSelectedTab, prevTabs.current, tabs, isControlled]);

    // Various auto-select routines based on what tabs are available
    useEffect(() => {
      // Clear selection if we didn't get any tabs
      if (tabs.length !== 0) {
        if (selectAddedTab()) {
          return;
        }

        const firstTab = tabs[0];
        const {name} = firstTab;

        // Make sure that the selected tab actually exists
        const selectedTabExists =
          tabs.length !== 0 && tabs.some((tab) => tab.name === currentSelectedTab);

        if (
          // Auto-select the first tab
          // If that's all we have, or...
          (tabs.length === 1 && currentSelectedTab !== name) ||
          // ...if there isn't a tab selected, or...
          !currentSelectedTab ||
          // ...if the currently selected tab doesn't exist.
          !selectedTabExists
        ) {
          selectTab(name);
        }
      }
    }, [tabs, currentSelectedTab, selectTab, isControlled]);

    // The tab content to render
    const selectedTabContent = useMemo(() => {
      const selectedTabItem = tabs.find((tab) => tab.name === currentSelectedTab);
      // Set the current tab content to the selected tab
      if (selectedTabItem) {
        return selectedTabItem.content;
      }

      return null;
    }, [tabs, currentSelectedTab]);

    // Fit the tab label into the ever-shrinking tab element
    const tabLabelFontSizeMultiplier =
      tabs.length <= 2 ? 1.75 : tabs.length < 4 ? 1.5 : tabs.length < 5 ? 1.2 : 1;

    return (
      <TabsWrapper className={className}>
        <TabButtonsWrapper>
          {tabs.map((tabOption, index) => (
            <Tooltip helpText={tabOption.helpText} key={`tab_${tabOption.name}_${index}`}>
              <TabButton
                data-testid={`${testIdPrefix}-tab ${testIdPrefix}-tab-${tabOption.name}`}
                fontSizeMultiplier={tabLabelFontSizeMultiplier}
                selected={currentSelectedTab === tabOption.name}
                onClick={() => selectTab(tabOption.name)}>
                {tabOption.loading && <LoadingIndicator data-testid="loading" />}
                <TabLabel>{tabOption.label}</TabLabel>
              </TabButton>
            </Tooltip>
          ))}
        </TabButtonsWrapper>
        {selectedTabContent && (
          <TabContentWrapper>{selectedTabContent}</TabContentWrapper>
        )}
      </TabsWrapper>
    );
  }
);

export default Tabs;
