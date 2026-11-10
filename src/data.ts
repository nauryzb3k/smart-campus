import type { Room } from "./types";

export const rooms: Room[] = [
  {
    id: "newton-101",
    name: "Newton 101",
    building: "Science Block",
    capacity: 40,
    blocked: false,
    bookings: [
      { start: 9 * 60, end: 10 * 60, label: "Physics Lecture" },
      { start: 14 * 60, end: 15 * 60 + 30, label: "Lab Session" },
    ],
  },
  {
    id: "tesla-2b",
    name: "Tesla Lab 2B",
    building: "Engineering Wing",
    capacity: 25,
    blocked: true,
    blockedReason: "Under maintenance until Oct 10",
    bookings: [],
  },
  {
    id: "curie-conf",
    name: "Curie Conference Room",
    building: "Research Center",
    capacity: 12,
    blocked: false,
    bookings: [
      { start: 11 * 60, end: 12 * 60, label: "Faculty Meeting" },
      { start: 13 * 60, end: 13 * 60 + 30, label: "Seminar Prep" },
    ],
  },
  {
    id: "davinci-studio",
    name: "Da Vinci Studio",
    building: "Arts Pavilion",
    capacity: 20,
    blocked: false,
    bookings: [
      { start: 10 * 60, end: 11 * 60 + 30, label: "Design Workshop" },
    ],
  },
  {
    id: "hawking-aud",
    name: "Hawking Auditorium",
    building: "Main Building",
    capacity: 200,
    blocked: false,
    bookings: [
      { start: 9 * 60, end: 9 * 60 + 45, label: "Morning Assembly" },
      { start: 15 * 60, end: 17 * 60, label: "Guest Lecture" },
    ],
  },
];
