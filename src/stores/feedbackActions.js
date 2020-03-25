import {action} from "mobx";

export default (state) => {
  const setFeedbackContent = action((content) => {
    state.feedbackContent = content;
  });

  const setFeedbackEmail = action((email) => {
    state.feedbackEmail = email;
  });

  return {
    setFeedbackContent,
    setFeedbackEmail,
  };
};
