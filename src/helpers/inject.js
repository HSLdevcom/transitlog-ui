import React, {useContext} from "react";
import {observer} from "mobx-react-lite";
import pick from "lodash/pick";
import {StoreContext} from "../stores/StoreContext";

export const inject = (...values) => (Component) =>
  observer((props) => {
    const {actions, state} = useContext(StoreContext);

    let pickProps = values;

    if (values.length === 0) {
      pickProps = Object.keys(actions);
    }

    const nextProps = {
      ...pick(actions, pickProps),
      state,
      ...props,
    };

    return <Component {...nextProps} />;
  });
