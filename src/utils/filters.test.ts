
import { describe, it, expect } from "vitest";
import { filterRooms } from "./filters";
import type { Room } from "../types";

const rooms: Room[] = [
  {
    id: "room-a",
    name: "Room A",
    building: "Main",
    capacity: 20,
    equipment: ["Projector", "Whiteboard"],
    blocked: false,
    bookings: [],
  },
  {
    id: "room-b",
    name: "Room B",
    building: "Main",
    capacity: 10,
    equipment: ["Computers"],
    blocked: false,
    bookings: [],
  },
  {
    id: "room-c",
    name: "Room C",
    building: "Main",
    capacity: 30,
    equipment: ["Projector", "Computers"],
    blocked: true,
    bookings: [],
  },
];

describe("filterRooms", () => {
  it("includes rooms with capacity equal to the minimum", () => {
    const result = filterRooms(rooms, {
      minCapacity: 20,
      equipment: [],
    });

    expect(result.map((room) => room.id)).toEqual(["room-a", "room-c"]);
  });

  it("excludes rooms below the minimum capacity", () => {
    const result = filterRooms(rooms, {
      minCapacity: 21,
      equipment: [],
    });

    expect(result.map((room) => room.id)).toEqual(["room-c"]);
  });

  it("requires all selected equipment", () => {
    const result = filterRooms(rooms, {
      minCapacity: 0,
      equipment: ["Projector", "Computers"],
    });

    expect(result.map((room) => room.id)).toEqual(["room-c"]);
  });

  it("excludes rooms missing one selected equipment item", () => {
    const result = filterRooms(rooms, {
      minCapacity: 0,
      equipment: ["Projector", "Whiteboard"],
    });

    expect(result.map((room) => room.id)).toEqual(["room-a"]);
  });

  it("returns an empty array when no rooms match", () => {
    const result = filterRooms(rooms, {
      minCapacity: 100,
      equipment: [],
    });

    expect(result).toEqual([]);
  });

  it("returns all rooms when no filters are applied", () => {
    const result = filterRooms(rooms, {
      minCapacity: 0,
      equipment: [],
    });

    expect(result).toHaveLength(3);
  });
});
