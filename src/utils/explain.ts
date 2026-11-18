import type {
  CheckResult,
  ExplanationInput,
  ExplanationOutput,
  ReasonCode,
  Room,
} from "../types";
import { minutesToTime } from "./booking";

export function buildExplanationInput(
  room: Room | null,
  result: CheckResult,
  start: number,
  end: number
): ExplanationInput {
  return {
    roomLabel: room?.name ?? "Unknown room",
    startMinutes: start,
    endMinutes: end,
    isAvailable: result.status === "available",
    reasonCode: classifyResult(room, result),
  };
}

function classifyResult(room: Room | null, result: CheckResult): ReasonCode {
  if (result.status === "available") {
    return "available";
  }
  if (!room) {
    return "room_not_selected";
  }
  const reason = result.reason;
  if (/blocked/i.test(reason)) {
    return "room_blocked";
  }
  if (/overlap/i.test(reason)) {
    return "booking_overlap";
  }
  if (/duration/i.test(reason)) {
    return "duration_exceeded";
  }
  if (/current time/i.test(reason)) {
    return "time_not_set";
  }
  if (/after the current time/i.test(reason)) {
    return "start_in_past";
  }
  return "invalid_interval";
}

export function validateExplanationInput(
  input: unknown
): string | null {
  if (typeof input !== "object" || input === null) {
    return "Explanation input must be an object.";
  }

  const candidate = input as Partial<ExplanationInput>;

  if (typeof candidate.roomLabel !== "string" || candidate.roomLabel.trim() === "") {
    return "Room label is missing.";
  }
  if (!Number.isFinite(candidate.startMinutes) || !Number.isFinite(candidate.endMinutes)) {
    return "Start and end times must be valid numbers.";
  }
  if (
    candidate.startMinutes! < 0 ||
    candidate.endMinutes! > 1440 ||
    candidate.startMinutes! >= candidate.endMinutes!
  ) {
    return "Start must be before end, within the 00:00-24:00 range.";
  }
  if (typeof candidate.isAvailable !== "boolean") {
    return "Availability flag must be a boolean.";
  }
  const validCodes: ReasonCode[] = [
    "room_not_selected",
    "invalid_interval",
    "time_not_set",
    "start_in_past",
    "duration_exceeded",
    "room_blocked",
    "booking_overlap",
    "available",
  ];
  if (!validCodes.includes(candidate.reasonCode as ReasonCode)) {
    return "Unknown reason code.";
  }

  return null;
}

export function generateExplanation(
  input: ExplanationInput
): ExplanationOutput {
  const inputError = validateExplanationInput(input);

  if (inputError) {
    return { text: fallbackExplanation(inputError), usedFallback: true };
  }

  try {
    const raw = mockAdapter(input);
    const outputError = validateExplanationOutput(raw, input.isAvailable);

    if (outputError) {
      return { text: fallbackExplanation(outputError), usedFallback: true };
    }

    return { text: raw, usedFallback: false };
  } catch {
    return {
      text: fallbackExplanation("The explanation service is unavailable."),
      usedFallback: true,
    };
  }
}

// Mock adapter standing in for a future LLM call. Deterministic, offline, no
// secrets. It only describes the checker's verdict; it never computes one.
function mockAdapter(input: ExplanationInput): string {
  const slot = `${minutesToTime(input.startMinutes)}–${minutesToTime(input.endMinutes)}`;

  switch (input.reasonCode) {
    case "available":
      return `${input.roomLabel} is free during ${slot}. No existing booking or block conflicts with this interval.`;
    case "room_not_selected":
      return "No room is selected, so availability cannot be confirmed. Select a room and check again.";
    case "room_blocked":
      return `${input.roomLabel} is currently blocked for maintenance or another restriction. No interval can be booked until the block is lifted.`;
    case "booking_overlap":
      return `${input.roomLabel} already has a booking overlapping ${slot}. Choose a nearby free slot on the timeline.`;
    case "duration_exceeded":
      return `The requested interval is longer than the 120-minute maximum. Shorten the interval to at most 120 minutes.`;
    case "start_in_past":
      return `The start time is not after the current time. Pick a start time later than now.`;
    case "time_not_set":
      return "The current time is not set, so past-time validation cannot run. Enter a valid current time.";
    case "invalid_interval":
    default:
      return `The interval ${slot} is not a valid time range. Ensure the start is earlier than the end within 00:00-24:00.`;
  }
}

export function validateExplanationOutput(
  text: unknown,
  isAvailable: boolean
): string | null {
  if (typeof text !== "string" || text.trim() === "") {
    return "Generated explanation is empty.";
  }

  const sentences = text.trim().split(/[.!?]+\s|[.!?]+$/).filter((s) => s.trim() !== "");

  if (sentences.length > 2) {
    return "Generated explanation exceeds two sentences.";
  }

  const claimsAvailable = /\b(available|free)\b/i.test(text);
  const claimsUnavailable = /\b(unavailable|blocked|overlap|cannot)\b/i.test(text);

  if (isAvailable && claimsUnavailable) {
    return "Generated explanation contradicts the confirmed available status.";
  }
  if (!isAvailable && claimsAvailable && !claimsUnavailable) {
    return "Generated explanation contradicts the confirmed unavailable status.";
  }

  return null;
}

function fallbackExplanation(cause: string): string {
  const decision = "The confirmed availability status above remains authoritative.";

  if (/contradict/i.test(cause)) {
    return `An explanation could not be generated safely. ${decision}`;
  }
  return `Explanation generation failed (${cause}). ${decision}`;
}
