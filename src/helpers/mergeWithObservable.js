import {extendObservable} from "mobx";

const mergeWithObservable = (observableObject, objectToMerge) => {
  Object.entries(objectToMerge).forEach(([key, value]) => {
    if (typeof observableObject[key] === "undefined") {
      extendObservable(observableObject, {
        [key]: value,
      });
    } else if (typeof value === "object" && !Array.isArray(value)) {
      mergeWithObservable(observableObject[key], value);
    } else {
      observableObject[key] = value;
    }
  });
  return observableObject;
};

export default mergeWithObservable;
