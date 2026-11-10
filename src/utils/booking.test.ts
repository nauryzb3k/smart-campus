
import { describe, it, expect } from "vitest";
import { minutesToTime, timeToMinutes } from "./booking";

describe("timeToMinutes", () => {
  it("converts a valid time to minutes", () => {
    expect(timeToMinutes("09:30")).toBe(570);
  });

  it("converts midnight correctly", () => {
    expect(timeToMinutes("00:00")).toBe(0);
  });

  it("converts the last minute of the day", () => {
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("rejects invalid hours", () => {
    expect(timeToMinutes("25:00")).toBeNaN();
  });

  it("rejects invalid minutes", () => {
    expect(timeToMinutes("12:60")).toBeNaN();
  });

  it("rejects a time without a leading zero", () => {
    expect(timeToMinutes("9:30")).toBeNaN();
  });

  it("rejects an invalid format", () => {
    expect(timeToMinutes("abc")).toBeNaN();
  });
});

describe("minutesToTime", () => {
  it("converts minutes to a formatted time", () => {
    expect(minutesToTime(570)).toBe("09:30");
  });

  it("converts midnight correctly", () => {
    expect(minutesToTime(0)).toBe("00:00");
  });
});
