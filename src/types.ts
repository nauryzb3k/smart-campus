export type Booking = {
  start: number;
  end: number;
  label: string;
};

export type Room = {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[]
  blocked: boolean;
  blockedReason?: string;
  bookings: Booking[];
};

export type CheckResult =
  | { status: "available" }
  | { status: "unavailable"; reason: string };
  
export type ReasonCode =
  | "room_not_selected"
  | "invalid_interval"
  | "time_not_set"
  | "start_in_past"
  | "duration_exceeded"
  | "room_blocked"
  | "booking_overlap"
  | "available";

export type ExplanationInput = {
  roomLabel: string;
  startMinutes: number;
  endMinutes: number;
  isAvailable: boolean;
  reasonCode: ReasonCode;
};

export type ExplanationOutput = {
  text: string;
  usedFallback: boolean;
};