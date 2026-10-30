import {extendObservable} from "mobx";
import feedbackActions from "./feedbackActions";

export const initialFeedback = {
  feedbackContent: "",
  feedbackEmail: "",
  feedbackImageFiles: new FormData(),
  feedbackImageFileNames: [],
};

const createFeedbackStore = (state) => {
  extendObservable(state, {
    ...initialFeedback,
    feedbackSending: false,
    showFeedbackSuccessMsg: false,
    showFeedbackError: false,
    showFeedbackImageError: false,
  });

  const actions = feedbackActions(state);

  return actions;
};

export default createFeedbackStore;
