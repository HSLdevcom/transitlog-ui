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

        const {name, label, loading, helpText = "", testId = name} = tabContent.props;
        return {name, label, content: tabContent, helpText, loading, testId};
      });

      return compact(childrenTabs);
    }, [validChildren]);

    // Various auto-select routines based on what tabs are available
    useEffect(() => {
      if (tabs.length !== 0) {
        const tabNames = tabs.map(({name}) => name);

        if (tabNames.length === 1) {
          selectTab(tabNames[0]);
          return;
        }

        let prevTabNames = [];

        if (prevTabs.current) {
          prevTabNames = prevTabs.current.map(({name}) => name);
        }

        prevTabs.current = tabs;
        const newTabs = difference(tabNames, prevTabNames);

        let nextTab = currentSelectedTab;

        if (newTabs.length !== 0) {
          // By default, auto-select the first newly added tab
          nextTab = newTabs[0];

          // If the new tabs contain the suggested tab, select that.
          if (tabNames.includes(suggestedTab)) {
            nextTab = suggestedTab;
          }
        }

        if (!tabNames.includes(nextTab)) {
          nextTab = tabNames[0];
        }

        if (nextTab && nextTab !== currentSelectedTab) {
          selectTab(nextTab);
        }
      }
    }, [tabs, currentSelectedTab, selectTab, isControlled]);

    // Sometimes, the selected tab might not actually exist. I such cases,
    // just show the first tab that exists. These conditions should not
    // last long, probably only when loading content.
    const visibleTab = useMemo(() => {
      if (tabs.length !== 0 && !tabs.map((t) => t.name).includes(currentSelectedTab)) {
        return tabs[0].name;
      }

      return currentSelectedTab;
    }, [currentSelectedTab, tabs]);

    // The tab content to render
    const selectedTabContent = useMemo(() => {
      const selectedTabItem = tabs.find((tab) => tab.name === visibleTab);
      // Set the current tab content to the selected tab
      if (selectedTabItem) {
        return selectedTabItem.content;
      }

      return null;
    }, [tabs, visibleTab]);

    // Fit the tab label into the ever-shrinking tab element
    const tabLabelFontSizeMultiplier =
      tabs.length <= 2 ? 1.75 : tabs.length < 4 ? 1.5 : tabs.length < 5 ? 1.2 : 1;

    return (
      <TabsWrapper className={className}>
        <TabButtonsWrapper>
          {tabs.map((tabOption, index) => (
            <Tooltip helpText={tabOption.helpText} key={`tab_${tabOption.name}_${index}`}>
              <TabButton
                data-testid={`${testIdPrefix}-tab ${testIdPrefix}-tab-${tabOption.testId}`}
                fontSizeMultiplier={tabLabelFontSizeMultiplier}
                selected={visibleTab === tabOption.name}
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
