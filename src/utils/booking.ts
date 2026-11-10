import type { CheckResult, Room } from "../types";

export function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

export function checkAvailability(
  room: Room | null,
  start: number,
  end: number,
  nowMinutes: number
): CheckResult {
  if (!room) {
    return { status: "unavailable", reason: "Please select a room." };
  }

  // AC1: 0 ≤ start < end ≤ 1440, start must be after current time
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return { status: "unavailable", reason: "Please enter valid start and end times." };
  }
  if (!(start >= 0 && start < end && end <= 1440)) {
    return { status: "unavailable", reason: "Start time must be earlier than end time, and both must be between 00:00 and 23:59." };
  }
  if (start <= nowMinutes) {
    return {
      status: "unavailable",
      reason: "Start time must be after the current time.",
    };
  }

  // AC2: max 120 minutes
  if (end - start > 120) {
    return { status: "unavailable", reason: "Booking duration cannot exceed 120 minutes." };
  }

  // AC3: room blocked
  if (room.blocked) {
    return {
      status: "unavailable",
      reason: room.blockedReason
        ? `Room is blocked — ${room.blockedReason}.`
        : "This room is currently blocked.",
    };
  }

  // AC4: no overlap (touching endpoints allowed)
  for (const b of room.bookings) {
    if (start < b.end && end > b.start) {
      return {
        status: "unavailable",
        reason: `Overlaps existing booking (${minutesToTime(b.start)}–${minutesToTime(
          b.end
        )}).`,
      };
    }
  }

  return { status: "available" };
}
