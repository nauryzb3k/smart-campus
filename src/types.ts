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
  blocked: boolean;
  blockedReason?: string;
  bookings: Booking[];
};

export type CheckResult =
  | { status: "available" }
  | { status: "unavailable"; reason: string };
