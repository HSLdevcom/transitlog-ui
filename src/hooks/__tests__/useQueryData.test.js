import React from "react";
import renderer, {act} from "react-test-renderer";
import {useQuery} from "@apollo/react-hooks";
import {useQueryData} from "../useQueryData";

jest.mock("@apollo/react-hooks", () => ({
  useQuery: jest.fn(),
}));

describe("useQueryData date variable debounce", () => {
  let queryOptions;
  let root;

  const Query = ({variables}) => {
    useQueryData(null, {variables});
    return null;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    queryOptions = null;
    useQuery.mockImplementation((query, options) => {
      queryOptions = options;
      return {};
    });
  });

  afterEach(() => {
    if (root) {
      act(() => root.unmount());
      root = null;
    }
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("waits for date changes to settle while applying other variables immediately", () => {
    act(() => {
      root = renderer.create(<Query variables={{date: "2026-10-01", routeId: "100"}} />);
    });
    expect(queryOptions.variables).toEqual({date: "2026-10-01", routeId: "100"});

    act(() => {
      root.update(<Query variables={{date: "2026-10-02", routeId: "200"}} />);
    });
    expect(queryOptions.variables).toEqual({date: "2026-10-01", routeId: "200"});

    act(() => jest.advanceTimersByTime(399));
    expect(queryOptions.variables.date).toBe("2026-10-01");

    act(() => jest.advanceTimersByTime(1));
    expect(queryOptions.variables.date).toBe("2026-10-02");
  });

  it("only queries the final date when the date changes repeatedly", () => {
    act(() => {
      root = renderer.create(<Query variables={{departureDate: "2026-10-01"}} />);
    });
    act(() => {
      root.update(<Query variables={{departureDate: "2026-10-02"}} />);
    });
    act(() => jest.advanceTimersByTime(200));
    act(() => {
      root.update(<Query variables={{departureDate: "2026-10-03"}} />);
    });

    expect(queryOptions.variables.departureDate).toBe("2026-10-01");

    act(() => jest.advanceTimersByTime(399));
    expect(queryOptions.variables.departureDate).toBe("2026-10-01");

    act(() => jest.advanceTimersByTime(1));
    expect(queryOptions.variables.departureDate).toBe("2026-10-03");
  });
});
