import trim from "lodash/trim";

export const parseLineNumber = (lineId) => {
  const lineStr = trim(lineId + "").replace(/\s(.*|\s)/g, "");
  // Special case for train lines, they should only show a letter.
  if (/^300[12]/.test(lineStr)) {
    return lineStr.replace(/\d+/, "");
  }

  if (lineStr.toLowerCase().startsWith("31m")) {
    return lineStr.substr(2);
  }

  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  return lineStr
    .substring(1)
    .replace(/^0+/, "")
    .replace(/\s/g, "");
};
