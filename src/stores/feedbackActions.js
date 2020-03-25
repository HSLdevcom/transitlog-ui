import {action} from "mobx";

export default (state) => {
  const setContent = action((content) => {
    state.feedbackContent = content;
  });

  const setEmail = action((email) => {
    state.feedbackEmail = email;
  });

  const addImageFiles = action((files) => {
    const fileNames = state.feedbackImageFiles.map((file) => file.name);
    let uniqueFiles = [...state.feedbackImageFiles];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!fileNames.includes(file.name)) {
        uniqueFiles.push(file);
        console.log("read file form input", file);
      } else {
        console.log("file was already selected:", file.name);
      }
    }
    state.feedbackImageFiles = uniqueFiles;
  });

  const removeImageFile = action((fileName) => {
    const keepFiles = state.feedbackImageFiles.filter((file) => file.name !== fileName);
    state.feedbackImageFiles = keepFiles;
  });

  return {
    setContent,
    setEmail,
    addImageFiles,
    removeImageFile,
  };
};
