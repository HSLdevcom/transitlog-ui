import {observable} from "mobx";
import FilterStore, {setResetListener} from "./FilterStore";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";

const currentDate = moment.tz(new Date(), TIMEZONE).format("YYYY-MM-DD");

describe("FilterStore", () => {
  test("It extends the provided state object with the filter state", () => {
    // Create empty state
    const state = observable({});
    FilterStore(state);

    // Just check that it adds some keys. We don't want to assert the presence of
    // the exact state props here as that would make the test fragile.
    expect(Object.keys(state).length).toBeGreaterThan(0);

    // The state is initialized with the current date
    expect(state.date).toBe(currentDate);
  });

  test("It adds the provided initialState to the state.", () => {
    // The FilterStore accepts any props in initialState when testing. This is because
    // we don't want to be too tied up in the exact state props.
    const initialState = {
      date: "2018-04-13",
      stop: "1234567",
      vehicle: "04/13",
      "route.routeId": "1013",
      "route.direction": 1,
      "route.originStopId": "1234567",
    };

    // Create empty state
    const state = observable({});
    FilterStore(state, initialState);

    expect(state.date).toBe("2018-04-13");
    expect(state.stop).toBe("1234567");
    expect(state.vehicle).toBe("04/13");
    expect(state.route).toMatchObject({
      routeId: "1013",
      direction: 1,
      originStopId: "1234567",
    });
  });

  test("It can reset the state", () => {
    const resetCallback = jest.fn();

    const initialState = {
      date: "2018-04-13",
      stop: "1234567",
      "route.routeId": "1013",
      "route.direction": 1,
    };

    const state = observable({});
    const {reset} = FilterStore(state, initialState);

    setResetListener(resetCallback);

    reset();

    expect(resetCallback).toHaveBeenCalledTimes(1);
    // It should reset the stop
    expect(state.stop).toBe("");
    // ...and the route
    expect(state.route.routeId).toBe("");
    expect(state.route.direction).toBe("");
    // but it should NOT reset the date
    expect(state.date).toBe(initialState.date);
  });

  test("setRoute sets the route props in the state", () => {
    const route = {
      routeId: "1013",
      direction: 1,
      originStopId: "1234567",
    };

    const state = observable({});
    const {setRoute} = FilterStore(state);

    expect(state.route.routeId).toBe("");

    setRoute(route);

    expect(state.route).toMatchObject(route);
  });

  test("setDate sets the passed date in the store in the correct format", () => {
    const state = observable({});
    const {setDate} = FilterStore(state);

    // The date should always be in the YYYY-MM-DD format
    const date = "2018-04-13";
    setDate(date);
    expect(state.date).toBe(date);

    // But in case it is not, moment will format it into the correct format.
    // Here we are setting the current date by passing an undefined or falsy value.
    const date2 = undefined;
    setDate(date2);
    expect(state.date).toBe(currentDate);

    // All formats that moment supports can be passed, including RFC 2822. The time
    // part is not important but may affect the resulting date after timezone conversion.
    // The timezone is always UTC when testing, in production it is UTC+2 for HSL so
    // this time would result in the date being 2018-04-14.
    const date3 = "13 Apr 2018 23:22:23 z";
    setDate(date3);
    expect(state.date).toBe(date);
  });
});
