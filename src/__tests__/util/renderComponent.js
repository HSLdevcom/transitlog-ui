import isEqual from "lodash/isEqual";
import {render} from "@testing-library/react";

export const renderComponent = (getComponent = () => {}) => {
  let mounted;
  let renderedProps = {};

  return {
    render: (props) => {
      if (!mounted) {
        mounted = render(getComponent(props));
        renderedProps = props;
      } else if (mounted && !isEqual(renderedProps, props)) {
        mounted.rerender(getComponent(props));
        renderedProps = props;
      }

      return mounted;
    },
    onBeforeEach: () => {
      mounted = false;
      renderedProps = {};
    },
  };
};
