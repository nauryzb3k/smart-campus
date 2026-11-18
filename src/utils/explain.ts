
import type {
  CheckResult,
  ExplanationInput,
  ExplanationOutput,
  ReasonCode,
  Room,
} from "../types";
import { minutesToTime } from "./booking";

export type ExplanationAdapter = (input: ExplanationInput) => string;

export class ExplanationAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExplanationAdapterError";
  }
}

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
  if (result.status === "available") return "available";
  if (!room) return "room_not_selected";

  const reason = result.reason;

  if (/blocked/i.test(reason)) return "room_blocked";
  if (/overlap/i.test(reason)) return "booking_overlap";
  if (/duration/i.test(reason)) return "duration_exceeded";

  // Check the more specific phrase first.
  if (/after the current time/i.test(reason)) return "start_in_past";
  if (/current time/i.test(reason)) return "time_not_set";

  return "invalid_interval";
}

export function validateExplanationInput(
  input: unknown
): string | null {
  if (typeof input !== "object" || input === null) {
    return "Explanation input must be an object.";
  }

  const candidate = input as Partial<ExplanationInput>;

  if (
    typeof candidate.roomLabel !== "string" ||
    candidate.roomLabel.trim() === ""
  ) {
    return "Room label is missing.";
  }

  if (candidate.roomLabel.length > 100) {
    return "Room label must not exceed 100 characters.";
  }

  if (
    !Number.isFinite(candidate.startMinutes) ||
    !Number.isFinite(candidate.endMinutes)
  ) {
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

  if (
    candidate.isAvailable !== (candidate.reasonCode === "available")
  ) {
    return "Availability status and reason code do not match.";
  }

  return null;
}

export function generateExplanation(
  input: ExplanationInput,
  adapter: ExplanationAdapter = mockAdapter
): ExplanationOutput {
  const inputError = validateExplanationInput(input);

  if (inputError) {
    return {
      text: fallbackExplanation(inputError),
      usedFallback: true,
    };
  }

  try {
    const raw = adapter(input);
    const outputError = validateExplanationOutput(raw, input.isAvailable);

    if (outputError) {
      return {
        text: fallbackExplanation(outputError),
        usedFallback: true,
      };
    }

    return { text: raw, usedFallback: false };
  } catch {
    return {
      text: fallbackExplanation("The explanation service is unavailable."),
      usedFallback: true,
    };
  }
}

// Offline mock adapter. It explains the checker's result;
// it never determines availability or creates booking data.
function mockAdapter(input: ExplanationInput): string {
  const slot = `${minutesToTime(input.startMinutes)}–${minutesToTime(input.endMinutes)}`;

  switch (input.reasonCode) {
    case "available":
      return `${input.roomLabel} is free during ${slot}. No existing booking or block conflicts with this interval.`;

    case "room_not_selected":
      return "No room is selected, so availability cannot be confirmed. Select a room and check again.";

    case "room_blocked":
      return `${input.roomLabel} is currently blocked. Its confirmed availability status remains unavailable.`;

    case "booking_overlap":
      return `${input.roomLabel} has an existing booking overlapping ${slot}. Choose another time slot.`;

    case "duration_exceeded":
      return "The requested interval exceeds the allowed duration. Shorten the interval and check again.";

    case "start_in_past":
      return "The requested start time is in the past. Choose a later start time.";

    case "time_not_set":
      return "The current time is not set, so past-time validation cannot run. Enter a valid current time.";

    case "invalid_interval":
    default:
      return `The interval ${slot} is not a valid time range. Ensure the start is earlier than the end.`;
  }
}

export function validateExplanationOutput(
  text: unknown,
  isAvailable: boolean
): string | null {
  if (typeof text !== "string" || text.trim() === "") {
    return "Generated explanation is empty.";
  }

  const sentences = text
    .trim()
    .split(/[.!?]+\s|[.!?]+$/)
    .filter((sentence) => sentence.trim() !== "");

  if (sentences.length > 2) {
    return "Generated explanation exceeds two sentences.";
  }

  const claimsAvailable = /\b(available|free)\b/i.test(text);
  const claimsUnavailable =
    /\b(unavailable|blocked|overlap|cannot)\b/i.test(text);

  if (claimsAvailable && claimsUnavailable) {
    return "Generated explanation contains conflicting availability claims.";
  }

  if (isAvailable && claimsUnavailable) {
    return "Generated explanation contradicts the confirmed available status.";
  }

  if (!isAvailable && claimsAvailable) {
    return "Generated explanation contradicts the confirmed unavailable status.";
  }

  return null;
}

function fallbackExplanation(cause: string): string {
  const decision =
    "The confirmed availability status remains authoritative.";

  if (/contradict|conflicting/i.test(cause)) {
    return `A safe explanation could not be generated. ${decision}`;
  }

  return `Explanation generation failed (${cause}). ${decision}`;
}
