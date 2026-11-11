# AGENTS.md — Smart Campus Room Availability Checker

## Project overview

A single-page web application that lets users check whether a campus room is
available for a given time interval. Built with React, TypeScript, and Vite.
Data is fictional and static — there is no backend, no persistence, and no
network access.

- Stack: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Vitest 2.
- Icons: lucide-react.
- All room data is hardcoded in `src/data.ts`.
- No authentication, no database, no external production services, and no real
  personal data are involved.

## Project constraints

1. Preserve acceptance criteria AC1–AC6 at all times. These criteria are
   defined in the original Practice assignment document. Take them from that
   source — do not invent, redefine, or paraphrase them. If the assignment
   document is unavailable, ask the user before proceeding.
2. Do not introduce Supabase or any other database. The `@supabase/supabase-js`
   entry in `package.json` is unused and should not be wired in.
3. Do not add authentication of any kind.
4. Do not add dependencies without a clear, stated justification.
5. Do not change existing room data or bookings in `src/data.ts` unless
   explicitly required by the task.
6. Keep changes minimal and focused. Prefer editing existing files over
   creating new ones. Do not refactor code unrelated to the task.

## Architecture

| File | Responsibility |
|---|---|
| `src/App.tsx` | Main UI, state management, event handlers, filter controls, result display. |
| `src/data.ts` | Static room catalog (5 fictional rooms with equipment, capacity, bookings, blocked status). |
| `src/types.ts` | TypeScript types: `Room`, `Booking`, `CheckResult`. |
| `src/utils/availability.ts` | `validateTimeInterval` and `checkAvailability` — interval validation, blocked-room check, booking overlap detection. Exports `MAX_DURATION = 120`. |
| `src/utils/booking.ts` | `timeToMinutes` (strict `HH:mm` parsing) and `minutesToTime` (minutes → `HH:mm` formatting). |
| `src/utils/filters.ts` | `filterRooms` — capacity and equipment filtering. Does not modify input data. |
| `src/components/TimeBar.tsx` | 24-hour timeline visualization showing existing bookings, candidate interval, and current-time marker. |

### Import conventions

- Use the `@/` path alias (maps to `src/`) for application code imports.
  Example: `import { filterRooms } from "@/utils/filters"`.
- Use relative imports in test files (`../types`, `./availability`, etc.) until
  the Vitest alias configuration is fixed. `vitest.config.ts` does not currently
  define a `resolve.alias` entry for `@`, so `@/`-prefixed imports in test files
  will fail at module resolution.

## Verification commands

Run all four after any change, in this order:

```bash
npm run typecheck   # tsc --noEmit -p tsconfig.app.json
npm run lint        # eslint .
npm run test        # vitest run
npm run build       # vite build
```

All four must succeed before a change is considered complete. If any command
fails, fix the reported errors before re-running — do not skip a failing check.

### Test suite

- `src/utils/booking.test.ts` — 9 tests (time conversion).
- `src/utils/availability.test.ts` — 12 tests (validation, overlap, blocked rooms, boundaries, immutability).
- `src/utils/filters.test.ts` — 6 tests (capacity and equipment filtering).
- `src/App.test.tsx` — 1 integration test (room switching updates the result).

The count of 28 above is a static count from inspecting the test files at the
time of writing, not a verified current test result. The actual count and pass
status must be determined by running `npm run test`. Do not treat this number
as proof of anything — re-run and report the real output.

## Agent workflow

1. **Inspect before changing.** Read the files you plan to modify and any
   files that import them. Understand existing code before proposing changes.
2. **Explain before implementing.** Describe the proposed change and why it is
   needed. Wait for approval if the change is non-trivial or touches logic in
   `availability.ts`, `booking.ts`, or `filters.ts`.
3. **Do not claim tests passed unless they were actually executed.** Report
   exact test counts and any failures. If a command was not run, say so.
4. **Report exact results.** Paste or summarize the actual output of
   `typecheck`, `lint`, `test`, and `build`. Do not paraphrase a pass where
   there was a failure.
5. **Review the diff.** After changes, confirm that only the intended files
   were modified and that no unrelated code was altered.

## Evidence and historical results

- `REPORT.md` and `appendix.md` contain historical process documentation and
  past test results.
- Treat previous test results as **snapshots, not proof of current state**.
  They were captured on a different machine and date.
- The `evidence/` folder contains UTF-16LE-encoded terminal captures and
  screenshots. Read them with `iconv -f UTF-16LE -t UTF-8 <file>` if needed.
- **Re-run all verification commands** before making any release or
  completeness decision. Do not rely on documented results alone.
