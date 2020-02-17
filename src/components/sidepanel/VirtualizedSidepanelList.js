import React, {Component} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";
import {LoadingDisplay} from "../Loading";
import {List, AutoSizer} from "react-virtualized";

const ListWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: ${({hasHeader}) => (hasHeader ? "5rem 1fr" : "1fr")};
`;

const ListHeader = styled.header`
  display: flex;
  align-items: center;
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

@observer
class VirtualizedSidepanelList extends Component {
  render() {
    const {
      header,
      date,
      list = [],
      renderRow,
      loading = false,
      rowHeight,
      scrollToIndex,
      testId = "virtual-list",
    } = this.props;

    return (
      <ListWrapper data-testid={testId} hasHeader={!!header}>
        {header && <ListHeader>{header}</ListHeader>}
        <div>
          <AutoSizer>
            {({height, width}) => (
              <List
                date={date}
                scrollToIndex={scrollToIndex}
                estimatedRowSize={35}
                height={height}
                width={width}
                loading={loading}
                rowCount={list.length}
                rowHeight={rowHeight}
                rowRenderer={renderRow}
              />
            )}
          </AutoSizer>
          <LoadingDisplay loading={loading} />
        </div>
      </ListWrapper>
    );
  }
}

export default VirtualizedSidepanelList;
