import Fuse from "fuse.js";

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function search(items, query, keys, searchOptions = {}) {
  /**
   * This function searches the array `items` for items that match the search query.
   * The search query is split into words, and each item gets an array of terms created
   * for it through the `itemToSearchTerms` function. The query words are matched against
   * the item terms and a score is given based on how well they match. Each query word is
   * matched against the result set of the previous word, meaning all words have to
   * match the items that end up in the final result array. The result is then ordered
   * by match score so that the best matching item is first in the array.
   */
  // Clean the input query
  const queryValue = escapeRegexCharacters(query.trim().toLowerCase());

  if (!queryValue) {
    return items;
  }

  const itemKeys =
    typeof keys === "function" ? keys(queryValue) : Array.isArray(keys) ? keys : ["id"];

  // Find matching items from the filtered set.
  const fuse = new Fuse(items, {
    keys: itemKeys,
    ...searchOptions,
  });

  // Finally, order the result by the score each item got.
  return fuse.search(queryValue);
}
