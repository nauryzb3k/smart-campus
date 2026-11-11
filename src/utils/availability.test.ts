
import { describe, it, expect } from "vitest";
import { checkAvailability } from "./availability";
import type { Room } from "../types";

const roomA: Room = {
  id: "room-a",
  name: "Room A",
  building: "Main",
  capacity: 20,
  equipment: ["Projector", "Whiteboard"],
  blocked: false,
  bookings: [
    { start: 540, end: 600, label: "Morning meeting" },
  ],
};

const roomB: Room = {
  id: "room-b",
  name: "Room B",
  building: "Main",
  capacity: 10,
  equipment: ["Computers"],
  blocked: false,
  bookings: [],
};

describe("checkAvailability", () => {
  it("rejects a missing room", () => {
    expect(checkAvailability(null, 600, 660, 540).status)
      .toBe("unavailable");
  });

  it("rejects an invalid time interval", () => {
    expect(checkAvailability(roomB, 700, 600, 540).status)
      .toBe("unavailable");
  });

  it("rejects a start time in the past", () => {
    expect(checkAvailability(roomB, 500, 560, 540).status)
      .toBe("unavailable");
  });

  it("allows a booking lasting exactly 120 minutes", () => {
    expect(checkAvailability(roomB, 600, 720, 540).status)
      .toBe("available");
  });

  it("rejects a booking lasting 121 minutes", () => {
    expect(checkAvailability(roomB, 600, 721, 540).status)
      .toBe("unavailable");
  });

  it("allows an interval ending at 1440 minutes", () => {
    expect(checkAvailability(roomB, 1320, 1440, 1200).status)
      .toBe("available");
  });

  it("rejects a blocked room", () => {
    const blockedRoom = { ...roomB, blocked: true };

    expect(checkAvailability(blockedRoom, 600, 660, 540).status)
      .toBe("unavailable");
  });

  it("rejects an overlapping booking", () => {
    expect(checkAvailability(roomA, 570, 630, 500).status)
      .toBe("unavailable");
  });

  it("allows intervals that touch an existing booking boundary", () => {
    expect(checkAvailability(roomA, 600, 660, 500).status)
      .toBe("available");
  });

  it("does not modify existing bookings", () => {
    const originalBookings = JSON.stringify(roomA.bookings);

    checkAvailability(roomA, 570, 630, 500);

    expect(JSON.stringify(roomA.bookings)).toBe(originalBookings);
  });

  it("does not apply Room A bookings to Room B", () => {
    expect(checkAvailability(roomB, 570, 630, 500).status)
      .toBe("available");
  });

  it("returns available for a valid free interval", () => {
    expect(checkAvailability(roomB, 600, 660, 540).status)
      .toBe("available");
  });

  it("rejects a NaN nowMinutes (cleared current-time field)", () => {
    expect(checkAvailability(roomB, 600, 660, NaN).status)
      .toBe("unavailable");
  });

  it("returns a clear reason when nowMinutes is NaN", () => {
    const result = checkAvailability(roomB, 600, 660, NaN);
    expect(result.status).toBe("unavailable");
    if (result.status === "unavailable") {
      expect(result.reason).toMatch(/current time/i);
    }
  });
});
