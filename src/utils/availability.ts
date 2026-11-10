
import type { CheckResult, Room } from "../types";
import { minutesToTime } from "./booking";

export const MAX_DURATION = 120;

export function validateTimeInterval(
  start: number,
  end: number,
  nowMinutes: number
): string | null {
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return "Please enter valid start and end times.";
  }

  if (!(start >= 0 && start < end && end <= 1440)) {
    return "Start time must be earlier than end time, and both must be between 00:00 and 24:00.";
  }

  if (start <= nowMinutes) {
    return "Start time must be after the current time.";
  }

  if (end - start > MAX_DURATION) {
    return "Booking duration cannot exceed 120 minutes.";
  }

  return null;
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

  const validationError = validateTimeInterval(start, end, nowMinutes);

  if (validationError) {
    return { status: "unavailable", reason: validationError };
  }

  if (room.blocked) {
    return {
      status: "unavailable",
      reason: room.blockedReason
        ? `Room is blocked — ${room.blockedReason}.`
        : "This room is currently blocked.",
    };
  }

  for (const booking of room.bookings) {
    if (start < booking.end && end > booking.start) {
      return {
        status: "unavailable",
        reason: `Overlaps existing booking (${minutesToTime(
          booking.start
        )}–${minutesToTime(booking.end)}).`,
      };
    }
  }

  return { status: "available" };
}
