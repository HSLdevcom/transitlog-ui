import React, {Component} from "react";
import styled from "styled-components";
import {Text, text} from "../../helpers/text";
import {Button} from "../Forms";
import {observer, inject} from "mobx-react";
import ToggleButton from "../ToggleButton";
import {app} from "mobx-app";

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

@inject(app("Filters", "Update", "Time", "UI"))
@observer
class ControlBar extends Component {
  onClickReset = () => {
    this.props.Filters.reset();
  };

  onClickUpdate = () => this.props.Update.update();

  onToggleLive = () => this.props.Time.toggleLive();

  render() {
    const {
      className,
      UI,
      state: {live, timeIsCurrent},
    } = this.props;

    return (
      <Bar className={className}>
        <ControlButton
          data-testid="share-button"
          helpText="Share button"
          onClick={() => UI.toggleShareModal(true)}>
          <Text>general.share</Text>
        </ControlButton>
        <ControlButton
          data-testid="reset-button"
          helpText="Reset button"
          onClick={this.onClickReset}>
          <Text>filterpanel.reset</Text>
        </ControlButton>
        <ControlButton
          data-testid="update-button"
          helpText="Update button"
          onClick={this.onClickUpdate}>
          <Text>general.update</Text>
        </ControlButton>
        <PollToggle
          testId="simulation-toggle"
          helpText="Live toggle"
          type="checkbox"
          onChange={this.onToggleLive}
          name="query_polling"
          label={timeIsCurrent ? text("general.live") : text("general.auto_update")}
          checked={live}
          value="enabled"
        />
      </Bar>
    );
  }
}

export default ControlBar;
