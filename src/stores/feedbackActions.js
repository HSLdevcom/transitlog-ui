import {action} from "mobx";

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
      } else {
        console.log("file was already selected:", file.name);
      }
    }

    console.log("list adde files:");
    for (let file of state.feedbackImageFiles.values()) {
      console.log("formData has file:", file);
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

  const startSending = action(() => {
    state.feedbackSending = true;
  });

  const sentFeedback = action((response) => {
    state.feedbackError = response.status === 200 ? "" : "Error in sending feedback";
    if (response.status === 200) {
      state.feedbackContent = "";
      state.feedbackEmail = "";
    }
    state.feedbackSending = false;
  });

  return {
    setContent,
    setEmail,
    addImageFiles,
    removeImageFile,
    startSending,
    sentFeedback,
  };
};
