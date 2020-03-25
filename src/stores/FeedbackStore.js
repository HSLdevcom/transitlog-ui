import {extendObservable, observable} from "mobx";
import feedbackActions from "./feedbackActions";

export default (state) => {
  extendObservable(
    state,
    {
      feedbackContent: "",
      feedbackEmail: "",
    },
    {
      feedbackContent: observable.ref,
      feedbackEmail: observable.ref,
    }
  );

  const actions = feedbackActions(state);

  return actions;
};
