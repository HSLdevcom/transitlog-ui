import React, {Component} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";
import {Button} from "./Forms";

const Btn = styled(Button)`
  background: white;
  border-radius: 50%;
  padding: 0.5rem;
  color: white;
  height: auto;
`;

@observer
class RoundButton extends Component {
  render() {
    const {children, ...props} = this.props;
    return <Btn {...props}>{children}</Btn>;
  }
}

export default RoundButton;
