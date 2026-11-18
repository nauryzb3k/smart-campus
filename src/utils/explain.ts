import type {
  CheckResult,
  ExplanationInput,
  ExplanationOutput,
  ReasonCode,
  Room,
} from "../types";
import { minutesToTime } from "./booking";

export const MAX_ROOM_LABEL_LENGTH = 100;

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
  // Must run before the looser /current time/ check, or "Start time must be
  // after the current time." is misclassified as time_not_set.
  if (/after the current time/i.test(reason)) {
    return "start_in_past";
  }
  if (/current time/i.test(reason)) {
    return "time_not_set";
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
  if (candidate.roomLabel.length > MAX_ROOM_LABEL_LENGTH) {
    return `Room label must be at most ${MAX_ROOM_LABEL_LENGTH} characters.`;
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

export type ExplanationAdapter = (input: ExplanationInput) => string;

export type AdapterFailureKind =
  | "timeout"
  | "service_error"
  | "missing_api_key";

export class ExplanationAdapterError extends Error {
  readonly kind: AdapterFailureKind;

  constructor(kind: AdapterFailureKind) {
    super(`Simulated adapter failure: ${kind}`);
    this.name = "ExplanationAdapterError";
    this.kind = kind;
  }
}

// Builds an adapter that always fails with the given kind, so timeout,
// service-error and missing-key behavior can be verified safely offline.
export function failingAdapter(kind: AdapterFailureKind): ExplanationAdapter {
  return () => {
    throw new ExplanationAdapterError(kind);
  };
}

export function generateExplanation(
  input: ExplanationInput,
  adapter: ExplanationAdapter = mockAdapter
): ExplanationOutput {
  const inputError = validateExplanationInput(input);

  if (inputError) {
    return { text: fallbackExplanation(inputError), usedFallback: true };
  }

  try {
    const raw = adapter(input);
    const outputError = validateExplanationOutput(raw, input.isAvailable);

    if (outputError) {
      return { text: fallbackExplanation(outputError), usedFallback: true };
    }

    return { text: raw, usedFallback: false };
  } catch (error) {
    return {
      text: fallbackExplanation(describeAdapterFailure(error)),
      usedFallback: true,
    };
  }
}

function describeAdapterFailure(error: unknown): string {
  if (error instanceof ExplanationAdapterError) {
    switch (error.kind) {
      case "timeout":
        return "the explanation request timed out";
      case "missing_api_key":
        return "the explanation service is not configured (missing API key)";
      case "service_error":
        return "the explanation service returned an error";
    }
  }
  return "The explanation service is unavailable.";
}

// Mock adapter standing in for a future LLM call. Deterministic, offline, no
// secrets. It only describes the checker's verdict; it never computes one.
// Callers may inject any ExplanationAdapter (e.g. failingAdapter) in tests.
function mockAdapter(input: ExplanationInput): string {
  const slot = `${minutesToTime(input.startMinutes)}–${minutesToTime(input.endMinutes)}`;

  switch (input.reasonCode) {
    case "available":
      return `${input.roomLabel} is free during ${slot}. No existing booking or block conflicts with this interval.`;
    case "room_not_selected":
      return "No room is selected, so availability cannot be confirmed. Select a room and check again.";
    case "room_blocked":
      return `${input.roomLabel} is currently blocked, so this interval cannot be booked. The confirmed availability status above is authoritative.`;
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

  // Text claiming both free and unavailable is internally inconsistent no
  // matter which way the checker ruled.
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
  const decision = "The confirmed availability status above remains authoritative.";

  if (/contradict/i.test(cause)) {
    return `An explanation could not be generated safely. ${decision}`;
  }
  return `Explanation generation failed (${cause}). ${decision}`;
}
