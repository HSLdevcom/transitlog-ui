import {extendObservable, observable} from "mobx";
import feedbackActions from "./feedbackActions";

export default (state) => {
  extendObservable(
    state,
    {
      feedbackContent: "",
      feedbackEmail: "",
      feedbackIncludesUrl: true,
    },
    {
      feedbackContent: observable.ref,
      feedbackEmail: observable.ref,
      feedbackIncludesUrl: observable.ref,
    }
  );

  const actions = feedbackActions(state);

  return actions;
};
