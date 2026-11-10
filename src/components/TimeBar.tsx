import type { CheckResult, Room } from "../types";
import { minutesToTime } from "../utils/booking";

type Props = {
  room: Room | null;
  candidate: { start: number; end: number } | null;
  result: CheckResult | null;
  nowMinutes: number;
};

const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

export default function TimeBar({ room, candidate, result, nowMinutes }: Props) {
  return (
    <div className="mt-4">
      <div className="relative h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
        {/* hour grid lines */}
        {HOUR_TICKS.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 w-px bg-slate-200"
            style={{ left: `${(h / 24) * 100}%` }}
          />
        ))}

        {/* existing bookings */}
        {room?.bookings.map((b, i) => (
          <div
            key={i}
            className="absolute top-1 bottom-1 rounded bg-slate-400/80 flex items-center justify-center overflow-hidden"
            style={{
              left: `${(b.start / 1440) * 100}%`,
              width: `${((b.end - b.start) / 1440) * 100}%`,
            }}
            title={`${b.label} (${minutesToTime(b.start)}–${minutesToTime(b.end)})`}
          >
            <span className="text-[10px] font-medium text-white truncate px-1">
              {b.label}
            </span>
          </div>
        ))}

        {/* current time marker */}
        {nowMinutes >= 0 && nowMinutes <= 1440 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-500"
            style={{ left: `${(nowMinutes / 1440) * 100}%` }}
            title={`Now: ${minutesToTime(nowMinutes)}`}
          />
        )}

        {/* candidate interval */}
        {candidate &&
          candidate.start >= 0 &&
          candidate.end <= 1440 &&
          candidate.start < candidate.end && (
            <div
              className={`absolute top-0 bottom-0 rounded border-2 ${
                result?.status === "available"
                  ? "bg-emerald-400/40 border-emerald-500"
                  : result?.status === "unavailable"
                  ? "bg-rose-400/40 border-rose-500"
                  : "bg-blue-400/40 border-blue-500"
              }`}
              style={{
                left: `${(candidate.start / 1440) * 100}%`,
                width: `${((candidate.end - candidate.start) / 1440) * 100}%`,
              }}
              title={`Candidate: ${minutesToTime(candidate.start)}–${minutesToTime(
                candidate.end
              )}`}
            />
          )}
      </div>

      {/* hour labels */}
      <div className="relative mt-1 h-4 text-[10px] text-slate-400">
        {HOUR_TICKS.map((h) => (
          <span
            key={h}
            className="absolute -translate-x-1/2"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            {minutesToTime(h * 60)}
          </span>
        ))}
      </div>

      {/* legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-400/80" /> Existing booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-400/40 border border-emerald-500" />{" "}
          Candidate (available)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-400/40 border border-rose-500" />{" "}
          Candidate (unavailable)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-0.5 h-3 bg-amber-500" /> Current time
        </span>
      </div>
    </div>
  );
}
