import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import styled from "styled-components";
import {action, observable} from "mobx";
import {app} from "mobx-app";
import {LoadingDisplay} from "../Loading";

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
  box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.075);
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

@inject(app("state"))
@observer
class SidepanelList extends Component {
  scrollElementRef = React.createRef();
  scrollPositionRef = React.createRef();

  disposeScrollOffsetReaction = () => {};

  @observable
  scrollOffset = 0;
  listHeight = 0;
  updateScrollOffsetTimer = 0;

  // Scrolls the list so that the focused element is in the middle.
  scrollTo = (offset) => {
    if (offset && this.scrollElementRef.current) {
      this.scrollElementRef.current.scrollTop = offset - this.listHeight / 2;
    }
  };

  componentDidMount() {
    // Set the height of the list on mount
    if (this.scrollElementRef.current) {
      this.listHeight = this.scrollElementRef.current.getBoundingClientRect().height;
    }
  }

  componentWillUnmount() {
    this.disposeScrollOffsetReaction();
  }

  async componentDidUpdate({focusKey: prevFocusKey}) {
    let {focusKey, loading} = this.props;

    if (!loading) {
      if (this.updateScrollOffsetTimer) {
        clearTimeout(this.updateScrollOffsetTimer);
      }

      // Update the scroll offset 100 ms after any update.
      // There must be a timer here otherwise the list may not be rendered
      // before the scroll offset is read.
      this.updateScrollOffsetTimer = setTimeout(
        () => this.updateScrollOffset(focusKey !== prevFocusKey),
        300
      );
    }
  }

  updateScrollOffset = (reset = false) => {
    const offset = this.getScrollOffset(reset);

    if (offset && (!this.scrollOffset || offset !== this.scrollOffset)) {
      this.setScrollOffset(offset);
    }
  };

  // Get the scroll offset in pixels.
  // This method only gets a new position if the scrollOffset has not previously been set.
  // This behaviour can be overridden by setting the reset arg to true.
  getScrollOffset = (reset = false) => {
    if (this.scrollPositionRef.current && (!this.scrollOffset || reset)) {
      let offset = this.scrollPositionRef.current.offsetTop;

      if (offset) {
        return offset;
      }
    }

    return this.scrollOffset;
  };

  setScrollOffset = action((offset) => {
    this.scrollOffset = offset;
  });

  render() {
    const {
      state: {live},
      header,
      floatingListHeader,
      children = () => {},
      loading = false,
      testIdPrefix = "sidepanel-list",
    } = this.props;

    this.scrollTo(this.scrollOffset);

    return (
      <ListWrapper hasHeader={!!header} data-testid={`${testIdPrefix}-list`}>
        {header && <ListHeader>{header}</ListHeader>}
        <ListContainer>
          {floatingListHeader && (
            <FloatingListHeader>{floatingListHeader}</FloatingListHeader>
          )}
          <ListRows ref={this.scrollElementRef}>
            <ScrollContainer>
              {children(this.scrollPositionRef, this.updateScrollOffset)}
            </ScrollContainer>
          </ListRows>
          {!live && <LoadingDisplay loading={loading} />}
        </ListContainer>
      </ListWrapper>
    );
  }
}

export default SidepanelList;
