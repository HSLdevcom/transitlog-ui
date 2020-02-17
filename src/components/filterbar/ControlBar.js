import React, {useCallback} from "react";
import styled from "styled-components";
import {Text, text} from "../../helpers/text";
import {Button} from "../Forms";
import {observer} from "mobx-react-lite";
import ToggleButton from "../ToggleButton";
import {inject} from "../../helpers/inject";
import flow from "lodash/flow";

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1 0 auto;
`;

const ControlButton = styled(Button).attrs({small: true, transparent: true})`
  font-size: 0.75rem;
  padding: 0.2rem 0.75rem;
  margin-right: 1rem;

  &:last-child {
    margin-right: 0;
  }
`;

const PollToggle = styled(ToggleButton).attrs({inverted: true})`
  flex: 0;
  color: white;
`;

const decorate = flow(observer, inject("Filters", "Update", "Time", "UI"));

const ControlBar = decorate(
  ({className, UI, Filters, Update, Time, state: {live, timeIsCurrent}}) => {
    const onClickReset = useCallback(() => Filters.reset());
    const onClickUpdate = useCallback(() => Update.update(false));
    const onToggleLive = useCallback(() => Time.toggleLive());
    const onClickShare = useCallback(() => UI.toggleShareModal(true));

    return (
      <Bar className={className}>
        <ControlButton
          data-testid="share-button"
          helpText="Share button"
          onClick={onClickShare}>
          <Text>general.share</Text>
        </ControlButton>
        <ControlButton
          data-testid="reset-button"
          helpText="Reset button"
          onClick={onClickReset}>
          <Text>filterpanel.reset</Text>
        </ControlButton>
        <ControlButton
          data-testid="update-button"
          helpText="Update button"
          onClick={onClickUpdate}>
          <Text>general.update</Text>
        </ControlButton>
        <PollToggle
          testId="simulation-toggle"
          helpText="Live toggle"
          type="checkbox"
          onChange={onToggleLive}
          name="query_polling"
          label={timeIsCurrent ? text("general.live") : text("general.auto_update")}
          checked={live}
          value="enabled"
        />
      </Bar>
    );
  }
);

export default ControlBar;
