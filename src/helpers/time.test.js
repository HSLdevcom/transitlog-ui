import {
  timeToSeconds,
  getNormalTime,
  getTimeString,
  getMomentFromDateTime,
  secondsToTime,
} from "./time";
import {TIMEZONE} from "../constants";

describe("Time helpers", () => {
  test("timeToSeconds converts a time string to number of seconds", () => {
    const timeStr = "14:30:20";
    const seconds = timeToSeconds(timeStr);

    const expectSeconds = 52220;

    expect(seconds).toBe(expectSeconds);
  });

  test("timeToSeconds works with a 24h+ time", () => {
    const timeStr = "26:30:20";
    const seconds = timeToSeconds(timeStr);

    const expectSeconds = 95420;

    expect(seconds).toBe(expectSeconds);
  });

  test("secondsToTime returns a time string for a duration in seconds", () => {
    const seconds = 5430;

    const timeStr = secondsToTime(seconds);
    const expected = "01:30:30";

    expect(timeStr).toBe(expected);
  });

  test("timeToSeconds and secondsToTime work well together", () => {
    const test1Time = secondsToTime(109210);
    const test1Secs = timeToSeconds("30:20:10");

    const test2Secs = timeToSeconds("13:59:48");
    const test2Time = secondsToTime(50388);

    expect(timeToSeconds(test1Time)).toBe(test1Secs);
    expect(secondsToTime(test1Secs)).toBe(test1Time);

    expect(secondsToTime(test2Secs)).toBe(test2Time);
    expect(timeToSeconds(test2Time)).toBe(test2Secs);
  });

  test("getNormalTime converts a 24h+ time to a 24h time.", () => {
    const timeStr = "26:30:20";
    const normalTime = getNormalTime(timeStr);

    const expectTime = "02:30:20";

    expect(normalTime).toBe(expectTime);
  });

  test("getNormalTime does not mess up a 24h time", () => {
    const timeStr = "14:30:20";
    const normalTime = getNormalTime(timeStr);

    const expectTime = "14:30:20";

    expect(normalTime).toBe(expectTime);
  });

  test("getTimeString converts numeric hours, minutes and seconds to a valid time string", () => {
    const timeStr = getTimeString(9, 28, 5);
    const expectTime = "09:28:05";

    expect(timeStr).toBe(expectTime);
  });

  test("getMomentFromDateTime returns a moment for a date and a time", () => {
    const time = "15:30:44";
    const date = "2019-01-28";

    const dateTime = getMomentFromDateTime(date, time, TIMEZONE);
    const expectTime = date + " " + time;

    expect(dateTime.format("YYYY-MM-DD HH:mm:ss")).toBe(expectTime);
  });

  test("getMomentFromDateTime works with 24h+ times", () => {
    const time = "25:30:44";
    const date = "2019-01-28";

    const dateTime = getMomentFromDateTime(date, time, TIMEZONE);
    const expectTime = "2019-01-29 01:30:44";

    expect(dateTime.format("YYYY-MM-DD HH:mm:ss")).toBe(expectTime);
  });
});
