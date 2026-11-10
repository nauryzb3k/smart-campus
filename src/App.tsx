import { useMemo, useState } from "react";
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { rooms } from "./data";
import { filterRooms } from "./utils/filters";
import type { CheckResult, Room } from "./types";
import { minutesToTime, timeToMinutes } from "./utils/booking";
import {
  checkAvailability,
  validateTimeInterval,
} from "./utils/availability";
import TimeBar from "./components/TimeBar";

function defaultNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
  const allEquipment = Array.from(
    new Set(rooms.flatMap((room) => room.equipment))
  );
export default function App() {
  const [selectedId, setSelectedId] = useState<string>(rooms[0].id);
  const [startTime, setStartTime] = useState("10:30");
  const [endTime, setEndTime] = useState("11:30");
  const [nowTime, setNowTime] = useState(defaultNow());
  const [result, setResult] = useState<CheckResult | null>(null);
  const [minCapacity, setMinCapacity] = useState(0);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const filteredRooms = useMemo(
  () => filterRooms(rooms, {
    minCapacity,
    equipment: selectedEquipment,
  }),
  [minCapacity, selectedEquipment]
);

const selectedRoom: Room | undefined =
  filteredRooms.find((room) => room.id === selectedId) ?? filteredRooms[0];
  function handleEquipmentChange(item: string, checked: boolean) {
  setSelectedEquipment((current) =>
    checked
      ? [...current, item]
      : current.filter((equipment) => equipment !== item)
  );

  setResult(null);
}
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const nowMin = timeToMinutes(nowTime);

  const candidate = useMemo(
    () =>
      !Number.isNaN(startMin) && !Number.isNaN(endMin) && startMin < endMin
        ? { start: startMin, end: endMin }
        : null,
    [startMin, endMin]
  );

  const duration = !Number.isNaN(startMin) && !Number.isNaN(endMin) ? endMin - startMin : 0;

  const validationError = validateTimeInterval(
    startMin,
    endMin,
    nowMin
  );
  function handleCheck() {
    setResult(
      checkAvailability(selectedRoom ?? null, startMin, endMin, nowMin)
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-sm">
              <CalendarCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Smart Campus Room Availability
              </h1>
              <p className="text-sm text-slate-500">
                Check whether a room is free for your desired time slot.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              Select a Room
            </h2>
            <div className="mb-5">
  <label
    htmlFor="minCapacity"
    className="block text-sm font-medium text-slate-700 mb-2"
  >
    Minimum room capacity
  </label>

  <input
    id="minCapacity"
    type="number"
    min="0"
    value={minCapacity}
    onChange={(e) => {
      setMinCapacity(Math.max(0, Number(e.target.value) || 0));
      setResult(null);
    }}
    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  />
</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {rooms.map((room) => {
                const active = room.id === selectedId;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedId(room.id);
                      setResult(null);
                    }}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      active
                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">
                          {room.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {room.building}
                        </p>
                      </div>
                      {room.blocked && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          <Lock size={10} /> Blocked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                      <Users size={12} /> {room.capacity} seats
                      <span className="mx-1">·</span>
                      {room.bookings.length} booking
                      {room.bookings.length !== 1 ? "s" : ""}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Time inputs */}
            <h2 className="text-sm font-semibold text-slate-900 mt-6 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              Time Interval
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Current time</span>
                <input
                  type="time"
                  value={nowTime}
                  onChange={(e) => {
                    setNowTime(e.target.value);
                    setResult(null);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Start</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setResult(null);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">End</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setResult(null);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>
            </div>

            {validationError && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                {validationError}
              </p>
            )}

            {duration > 0 && !Number.isNaN(duration) && (
              <p className="mt-3 text-xs text-slate-500">
                Duration: <span className="font-medium text-slate-700">{duration} min</span>
                {duration > 120 && (
                  <span className="text-rose-600 font-medium"> (exceeds 120 min limit)</span>
                )}
              </p>
            )}

            <button
              onClick={handleCheck}
              className="mt-5 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              <Search size={16} />
              Check Availability
            </button>
          </section>

          {/* Right: Result + Timeline */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              {selectedRoom?.name ?? "No room selected"}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {selectedRoom?.building} · {selectedRoom?.capacity} seats
              {selectedRoom?.blocked
                ? ` · Blocked: ${selectedRoom.blockedReason}`
                : ""}
            </p>

            {/* Result banner */}
            {result ? (
              result.status === "available" ? (
                <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                  <CheckCircle2
                    size={24}
                    className="text-emerald-600 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-emerald-900">Available</p>
                    <p className="text-sm text-emerald-700">
                      {minutesToTime(startMin)}–{minutesToTime(endMin)} is open in{" "}
                      {selectedRoom?.name}. No existing bookings or blocks conflict.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4">
                  <XCircle size={24} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-900">Unavailable</p>
                    <p className="text-sm text-rose-700">
                      <span className="font-medium">
                        {minutesToTime(startMin)}–{minutesToTime(endMin)} in{" "}
                        {selectedRoom?.name}:
                      </span>{" "}
                      {result.reason}
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 p-4">
                <Search size={24} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700">Ready to check</p>
                  <p className="text-sm text-slate-500">
                    Pick a room and time interval, then press{" "}
                    <span className="font-medium">Check Availability</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <h3 className="text-xs font-semibold text-slate-700 mt-6 mb-1">
              24-hour schedule
            </h3>
            <TimeBar
              room={selectedRoom ?? null}
              candidate={candidate}
              result={result}
              nowMinutes={nowMin}
            />

            {/* Existing bookings list */}
            {selectedRoom && selectedRoom.bookings.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-semibold text-slate-700 mb-2">
                  Existing bookings
                </h3>
                <ul className="space-y-1.5">
                  {selectedRoom.bookings.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2 border border-slate-100"
                    >
                      <span className="font-medium text-slate-700">{b.label}</span>
                      <span className="text-slate-500">
                        {minutesToTime(b.start)}–{minutesToTime(b.end)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Fictional sample data · No bookings are created or modified.
        </footer>
      </div>
    </div>
  );
}
