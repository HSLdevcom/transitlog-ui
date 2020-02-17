import {
  getUrlValue,
  setUrlValue,
  __setHistoryForTesting,
  getUrlState,
  resetUrlState,
} from "./UrlManager";
import {createMemoryHistory} from "history";

describe("UrlManager", () => {
  let history;

  beforeEach(() => {
    history = createMemoryHistory();
    __setHistoryForTesting(history);
  });

  test("setUrlValue can set a value in the URL", () => {
    let query = history.location.search;
    expect(query).toBe("");

    setUrlValue("test", "testvalue");

    query = history.location.search;
    expect(query).toBe("?test=testvalue");
  });

  test("setUrlValue can change a value in the URL", () => {
    setUrlValue("test", "testvalue");

    let query = history.location.search;
    expect(query).toBe("?test=testvalue");

    setUrlValue("test", "updated");

    query = history.location.search;
    expect(query).toBe("?test=updated");
  });

  test("setUrlValue can remove a value from the URL when passed null or undefined", () => {
    // Have something else in the URL too to keep things interesting
    setUrlValue("other", "othervalue");
    setUrlValue("test", "testvalue");
    setUrlValue("test", false); // False does not remove a value

    let query = history.location.search;
    expect(query).toBe("?other=othervalue&test=false");

    // Empty string does not remove the value
    setUrlValue("test", "");

    query = history.location.search;
    expect(query).toBe("?other=othervalue&test=");

    // Null removes the value
    setUrlValue("test", null);

    query = history.location.search;
    expect(query).toBe("?other=othervalue");

    setUrlValue("test", "newvalue");
    // Undefined removes the value
    setUrlValue("test", undefined);

    query = history.location.search;
    expect(query).toBe("?other=othervalue");
  });

  test("getUrlValue retrieves a value from the url", () => {
    setUrlValue("other", "othervalue");
    setUrlValue("test", "testvalue");

    const retrieved = getUrlValue("test");
    expect(retrieved).toBe("testvalue");
  });

  test("getUrlValue returns true boolean values", () => {
    setUrlValue("isfalse", "false");
    setUrlValue("isemptystring", undefined);
    setUrlValue("isalsoemptystring", "");
    setUrlValue("istrue", "true");

    expect(getUrlValue("isfalse")).toBe(false);
    expect(getUrlValue("isfalse")).not.toBe("false");
    expect(getUrlValue("isemptystring")).toBe("");
    expect(getUrlValue("isalsoemptystring")).toBe("");
    expect(getUrlValue("istrue")).toBe(true);
    expect(getUrlValue("istrue")).not.toBe("true");
  });

  test("getUrlState returns the URL search query as an object", () => {
    setUrlValue("other", "othervalue");
    setUrlValue("test", "testvalue");
    // Also handles true booleans
    setUrlValue("isfalse", "false");
    setUrlValue("istrue", "true");

    const urlState = getUrlState();

    expect(urlState).toMatchObject({
      test: "testvalue",
      other: "othervalue",
      isfalse: false,
      istrue: true,
    });
  });

  test("resetUrlState resets the URL search query and path", () => {
    history.replace("/testpath");
    setUrlValue("test", "testvalue");
    expect(history.location.pathname).toBe("/testpath");
    expect(history.location.search).toBe("?test=testvalue");

    // Does a replace when passing true
    resetUrlState(true);
    expect(history.location.pathname).toBe("/");
    expect(history.location.search).toBe("");
  });
});
