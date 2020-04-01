import {extendObservable, observable} from "mobx";
import feedbackActions from "./feedbackActions";

export default (state) => {
  extendObservable(
    state,
    {
      feedbackContent: "",
      feedbackEmail: "",
      feedbackImageFiles: new FormData(),
      feedbackImageFileNames: [],
      feedbackSending: false,
      feedbackError: null,
    },
    {
      feedbackContent: observable.ref,
      feedbackEmail: observable.ref,
      feedbackImageFiles: observable.ref,
      feedbackImageFileNames: observable.ref,
      feedbackSending: observable.ref,
      feedbackError: observable.ref,
    }
  );

  const actions = feedbackActions(state);

  return actions;
};
