import React, {useMemo} from "react";
import {useTooltip} from "../hooks/useTooltip";
import {observer} from "mobx-react-lite";

const Tooltip = observer(({children, helpText = ""}) => {
  const tooltipProps = useTooltip(helpText);

  return useMemo(() => {
    const onlyChild = React.Children.only(children);
    return React.cloneElement(onlyChild, tooltipProps);
  }, [children, tooltipProps]);
});

export default Tooltip;
