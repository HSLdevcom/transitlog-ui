import React, {useState, useCallback} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import {StyledInputBase} from "./Forms";
import {useTooltip} from "../hooks/useTooltip";

const Select = styled(StyledInputBase.withComponent("select"))`
  padding: 0 0.7rem;
  width: 100%;
`;

const Dropdown = observer((props) => {
  const [isEmpty, setIsEmpty] = useState(!props.value);

  const onChange = useCallback(
    (e) => {
      setIsEmpty(!e.target.value);
      props.onChange(e);
    },
    [props.onChange]
  );

  const {className, helpText = ""} = props;

  return (
    <Select
      {...props}
      {...useTooltip(helpText)}
      onChange={onChange}
      className={`${className} ${isEmpty ? "empty-select" : ""}`}
    />
  );
});

export default Dropdown;
