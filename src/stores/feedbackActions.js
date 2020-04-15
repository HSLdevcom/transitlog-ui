import {action} from "mobx";
import {initialFeedback} from "./FeedbackStore";

export default (state) => {
  const setContent = action((content) => {
    state.feedbackContent = content;
  });

  const setEmail = action((email) => {
    state.feedbackEmail = email;
  });

  const addImageFiles = action((files) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!state.feedbackImageFiles.has(file.name)) {
        state.feedbackImageFiles.append(file.name, file);
        state.feedbackImageFileNames = state.feedbackImageFileNames.concat(file.name);
        console.log("read file form input", file);
      }
    }
  });

  const removeImageFile = action((fileName) => {
    if (state.feedbackImageFiles.has(fileName)) {
      state.feedbackImageFiles.delete(fileName);
      state.feedbackImageFileNames = state.feedbackImageFileNames.filter(
        (fn) => fn !== fileName
      );
    }
  });

  const setSendingState = action((sending) => {
    state.feedbackSending = sending;
  });

  const showFeedbackError = action(() => {
    state.showFeedbackError = true;
  });

  const showFeedbackImageError = action(() => {
    state.showFeedbackImageError = true;
  });

  const showFeedbackSuccessMsg = action(() => {
    state.showFeedbackSuccessMsg = false;
    state.showFeedbackImageError = false;
    state.showFeedbackSuccessMsg = true;
  });

  const resetErrorAndSuccessMsg = action(() => {
    state.showFeedbackSuccessMsg = false;
    state.showFeedbackImageError = false;
    state.showFeedbackError = false;
  });

  const resetFeedback = action(() => {
    Object.entries(initialFeedback).forEach(([key, value]) => {
      state[key] = value;
    });
  });

  return {
    setContent,
    setEmail,
    addImageFiles,
    removeImageFile,
    setSendingState,
    showFeedbackError,
    showFeedbackImageError,
    showFeedbackSuccessMsg,
    resetErrorAndSuccessMsg,
    resetFeedback,
  };
};
