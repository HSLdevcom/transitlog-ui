import React, {Component, Children} from "react";
import {observer} from "mobx-react";
import styled, {keyframes} from "styled-components";
import compact from "lodash/compact";
import difference from "lodash/difference";
import {setUrlValue, getUrlValue} from "../../stores/UrlManager";
import Tooltip from "../Tooltip";

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
  flex: 1;
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

let selectedTab = "";

@observer
class Tabs extends Component {
  state = {
    selectedTab: getUrlValue("tab"),
  };

  onTabClick = (selectName) => () => {
    this.setState(
      {
        selectedTab: selectName,
      },
      () => {
        setUrlValue("tab", this.state.selectedTab);
      }
    );
  };

  componentDidUpdate({children: prevChildren}) {
    this.selectAddedTab(prevChildren);
  }

  selectAddedTab = (prevChildren) => {
    this.setState(({selectedTab: stateSelectedTab}) => {
      const {children, suggestedTab} = this.props;

      const prevChildrenArray = compact(Children.toArray(prevChildren)).map(
        ({props: {name}}) => name
      );

      const childrenArray = compact(Children.toArray(children)).map(
        ({props: {name}}) => name
      );

      const newChildren = difference(childrenArray, prevChildrenArray);
      const nextTab =
        newChildren.length === 1 && newChildren.includes(suggestedTab)
          ? suggestedTab
          : stateSelectedTab;

      if (!nextTab || nextTab === stateSelectedTab) return null;

      return {
        selectedTab: nextTab,
      };
    });
  };

  render() {
    const {children, className} = this.props;
    selectedTab = this.state.selectedTab || selectedTab; // Ensure that "transient" values stay between renders

    // The tab content to render
    let selectedTabContent = null;

    // The children usually contain an empty string as the first element.
    // Compact() removes all such falsy values from the array.
    const validChildren = compact(Children.toArray(children));

    let tabs = validChildren.map((tabContent, idx, allChildren) => {
      if (!tabContent || !React.isValidElement(tabContent)) {
        return null;
      }

      const {name, label, loading, helpText = ""} = tabContent.props;

      // If there is only one tab, select it right off. Or, if there
      // is no tab selected, autoselect the first tab.
      if (
        (allChildren.length === 1 && selectedTab !== name) ||
        (!selectedTab && idx === 0)
      ) {
        selectedTab = name;
      }

      // Set the current tab content to the selected tab
      if (name === selectedTab) {
        selectedTabContent = tabContent;
      }

      return {name, label, content: tabContent, helpText, loading};
    });

    if (tabs.length === 0) {
      selectedTab = "";
    }

    // The selected tab might not be available, so pick the first tab in that case.
    if (tabs.length !== 0 && tabs.findIndex((tab) => tab.name === selectedTab) === -1) {
      const {name, content} = tabs[0];
      selectedTab = name;
      selectedTabContent = content;
    }

    tabs = compact(tabs);

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
                selected={selectedTab === tabOption.name}
                onClick={this.onTabClick(tabOption.name)}>
                {tabOption.loading && <LoadingIndicator data-testid="loading" />}
                <TabLabel>{tabOption.label}</TabLabel>
              </TabButton>
            </Tooltip>
          ))}
        </TabButtonsWrapper>
        <TabContentWrapper>{selectedTabContent}</TabContentWrapper>
      </TabsWrapper>
    );
  }
}

export default Tabs;
