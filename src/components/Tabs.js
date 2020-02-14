import React, {Children, useState, useCallback, useEffect, useRef, useMemo} from "react";
import {observer} from "mobx-react";
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

const Tabs = decorate(
  ({
    selectedTab,
    urlValue = "tab",
    onTabChange = () => {},
    children,
    suggestedTab,
    className,
  }) => {
    const [currentSelectedTab, setSelectedTab] = useState(getUrlValue(urlValue));
    const prevChildren = useRef();

    const selectTab = useCallback(
      (nextSelectedTab) => {
        setSelectedTab(nextSelectedTab);
        setUrlValue(urlValue, nextSelectedTab);
        onTabChange(nextSelectedTab);
      },
      [currentSelectedTab, onTabChange]
    );

    // Function to auto-select any newly added tab
    const selectAddedTab = useCallback(() => {
      let prevChildrenArray = [];

      if (prevChildren.current) {
        prevChildrenArray = compact(Children.toArray(prevChildren.current)).map(
          ({props: {name}}) => name
        );
      }

      prevChildren.current = children;

      const childrenArray = compact(Children.toArray(children)).map(
        ({props: {name}}) => name
      );

      const newChildren = difference(childrenArray, prevChildrenArray);

      const nextTab =
        newChildren.length === 1 && newChildren.includes(suggestedTab)
          ? suggestedTab
          : selectedTab;

      if (nextTab && nextTab !== selectedTab) {
        selectTab(nextTab);
        return true;
      }

      return false;
    }, [currentSelectedTab, prevChildren.current, children]);

    // Either select a newly added tab or the tab that the props say should be selected.
    useEffect(() => {
      if (selectAddedTab()) {
        return;
      }

      if (selectedTab && selectedTab !== currentSelectedTab) {
        selectTab(selectedTab);
      }
    }, [selectedTab, currentSelectedTab]);

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

    // Various auto-select routines based on what tabs are available
    useEffect(() => {
      // Clear selection if we didn't get any tabs
      if (tabs.length === 0) {
        setSelectedTab("");
      } else {
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
    }, [tabs, currentSelectedTab, selectTab]);

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
                data-testid={`sidebar-tab sidebar-tab-${tabOption.name}`}
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
