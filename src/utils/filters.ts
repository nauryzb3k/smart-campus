
import type { Room } from "../types";

export type RoomFilters = {
  minCapacity: number;
  equipment: string[];
};

export function filterRooms(
  rooms: Room[],
  filters: RoomFilters
): Room[] {
  return rooms.filter((room) => {
    const matchesCapacity = room.capacity >= filters.minCapacity;

    const matchesEquipment = filters.equipment.every((item) =>
      room.equipment.includes(item)
    );

    return matchesCapacity && matchesEquipment;
  });
}
