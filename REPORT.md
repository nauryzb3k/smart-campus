# SIS #04 — Smart Campus

## 1. Initial Project Analysis

The initial project was developed using React, TypeScript, and Vite.

The application initially contained five rooms and supported checking room availability for a selected time interval.

### Initial project structure

- `App.tsx` — user interface and event handling.
- `data.ts` — room catalog.
- `types.ts` — TypeScript data types.
- `utils/booking.ts` — time conversion and availability checking.
- `components/TimeBar.tsx` — booking timeline visualization.

### Identified issues

1. Room data did not include equipment information.
2. Time validation did not strictly validate hour and minute ranges.
3. Some availability validation logic was duplicated between the UI and utility module.
4. Automated tests were not configured in the initial project.

## 2. Refactoring Plan

The project is organized into separate modules:

- Room catalog: `src/data.ts`
- Availability logic: `src/utils/availability.ts`
- Filtering logic: `src/utils/filters.ts`
- Time conversion: `src/utils/booking.ts`
- User interface: `src/App.tsx`

### Design Decisions

**1. Separation of responsibilities**

Application logic is separated into independent modules to improve maintainability and testability.

**2. Immutable booking data**

Availability checks read existing booking data without modifying it. This prevents unintended side effects.

## 3. Initial Verification

| Check | Initial result |
|---|---|
| Production build | Passed |
| ESLint | Passed with compatibility warning |
| TypeScript typecheck | Passed |
| Automated tests | Not configured |

## 4. Room Catalog Extension and Filtering

The initial room catalog was extended with an `equipment` array for each of the five rooms.

A separate filtering module (`src/utils/filters.ts`) was implemented. It supports:
- Minimum room capacity filtering.
- Equipment filtering requiring all selected equipment items.

The filtering function does not modify the original room catalog.

### Verification

- TypeScript typecheck: Passed.
- Production build: Passed.
- Existing room bookings were preserved.

## 5. Availability Logic Refactoring

Created `src/utils/availability.ts` to separate booking validation and availability checking from the user interface.

The module includes:
- `MAX_DURATION = 120`.
- Shared time interval validation.
- Blocked room validation.
- Existing booking overlap detection.
- Read-only access to booking data.

Time validation checks interval boundaries, future start time, and the maximum booking duration of 120 minutes.

Time conversion functions remain in `src/utils/booking.ts`. Strict `HH:mm` parsing rejects invalid hours, minutes, and malformed time strings.

The UI uses the shared `validateTimeInterval` function instead of duplicating interval validation.

## 6. Automated Testing

Configured Vitest 2.1.9 and added four test suites:

- `availability.test.ts` — 14 tests.
- `booking.test.ts` — 9 tests.
- `filters.test.ts` — 6 tests.
- `App.test.tsx` — 2 integration tests.

**Latest test result: 31/31 tests passed across 4 test files.**

The tests cover:
- Invalid time intervals and time formats.
- Booking duration boundaries: 120 and 121 minutes.
- Blocked rooms.
- Overlapping and adjacent bookings.
- Booking data immutability.
- Capacity and equipment filtering.
- Empty filtering results.
- Switching selected rooms and checking only the selected room's bookings.

The integration test verifies that changing the selected room updates the availability result.

### Step 4 Verification

| Check | Result |
|---|---|
| TypeScript typecheck | Passed |
| Automated tests | 28/28 passed |
| Production build | Passed |
| Git diff check | Passed; only line-ending warnings |

---

## 7. Practice #10 — Risk Audit, Remediation, and Release Decision

### 7.1 Risk Audit Summary

A read-only risk review of the Smart Campus Room Availability Checker was conducted after the Step 4 verification. The review examined `src/App.tsx`, `src/utils/availability.ts`, `src/utils/booking.ts`, `src/utils/filters.ts`, `src/data.ts`, `src/types.ts`, and `src/components/TimeBar.tsx`.

Five risks were identified across four categories (input validation, UI/access control, data integrity, and dependency/build hygiene). Four risks (R-03, R-05, R-08, R-09) were confirmed by direct source inspection. One risk (R-12) is labeled **provisional/unverified** because it could not be confirmed from the source alone.

| Risk | Category | Status |
|---|---|---|
| R-03 | Input validation | Confirmed |
| R-05 | Input validation | Confirmed |
| R-08 | UI / access control | Confirmed |
| R-09 | Data integrity | Confirmed |
| R-12 | Dependency / build hygiene | Provisional / unverified |

### 7.2 Risk Register

| ID | Category | Cause | Event | Impact | Component | Evidence | P | I | Score | Mitigation | Owner | Verification |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R-03 | Input validation | Start/end time fields accept empty or malformed values | Empty string parsed to NaN, bypasses comparison checks | Invalid intervals accepted; false "available" result | `src/utils/availability.ts` lines 12-14; `src/utils/booking.ts` `timeToMinutes` | Source inspection: `Number.isFinite` guard exists for start/end | 2 | 2 | 4 | Existing `Number.isFinite(start)` / `Number.isFinite(end)` guard at lines 12-14 | Developer | Covered by `availability.test.ts` invalid-interval tests |
| R-05 | Input validation | Current-time field (`<input type="time">`) can be cleared by the user, yielding NaN | `nowMinutes` is NaN; `start <= nowMinutes` evaluates to `false`, silently passing the past-time check | Past or current time slots accepted as valid | `src/utils/availability.ts` line 24; `src/App.tsx` `nowMin` derivation | Source inspection: no `Number.isFinite(nowMinutes)` guard before line 24 | 2 | 2 | 4 | Added `Number.isFinite(nowMinutes)` guard at lines 16-18, returning a clear error | Developer | Two regression tests in `availability.test.ts` lines 94-105 |
| R-08 | UI / access control | Blocked rooms are rendered as selectable buttons in the room list | User clicks a blocked room and sees availability results for it | User can attempt to book a room under maintenance; confusing UX | `src/App.tsx` room list rendering (line 163); `src/utils/availability.ts` lines 51-58 | Source inspection: no `disabled` attribute on room buttons; `checkAvailability` does reject blocked rooms as a backend safeguard | 2 | 2 | 4 | Added `disabled={room.blocked}` to room button; blocked rooms remain visible with badge and greyed-out style | Developer | Test in `App.test.tsx` lines 47-52; manual UI verification |
| R-09 | Data integrity | Availability check could mutate `room.bookings` array | Existing bookings modified or reordered during a check | Data corruption; incorrect future availability results | `src/utils/availability.ts` lines 60-69 | Source inspection: loop only reads bookings; no mutation found | 1 | 3 | 3 | No mutation performed; immutability test in `availability.test.ts` lines 76-82 | Developer | Test `"does not modify existing bookings"` confirms immutability |
| R-12 | Dependency / build hygiene | Browserslist database may be outdated in the build environment | Build emits a warning about outdated `caniuse` data | Non-fatal warning; no functional impact | `vite.config.ts`; build environment | Provisional: cannot confirm from source alone; warning is environment-dependent | 1 | 1 | 2 | No action required; warning is non-fatal | Developer | Build completes successfully; warning is informational only |

**Scoring:** Probability (P) and Impact (I) are rated 1-3. Score = P x I.

R-12 is marked **provisional/unverified** because the Browserslist warning depends on the build environment and could not be confirmed by source inspection alone. It is included for completeness but has no functional impact.

### 7.3 Selected Risks and Remediation

Two risks were selected for remediation: **R-05** and **R-08**.

**Selection rationale:**

- R-05 and R-08 both have a score of 4 (P=2, I=2), making them the highest-scoring confirmed risks alongside R-03.
- R-03 was already mitigated by the existing `Number.isFinite` guard for start/end times, so no new work was needed.
- R-09 has a lower score (3) and was already covered by an existing immutability test.
- R-12 is provisional with the lowest score (2) and requires no code change.
- R-05 and R-08 were the only confirmed risks with no existing mitigation in place.

**R-05: NaN current-time input rejected with a clear error**

- Added a `Number.isFinite(nowMinutes)` guard in `validateTimeInterval` (`src/utils/availability.ts` lines 16-18), placed before the past-time check at line 24 that would otherwise silently pass when `nowMinutes` is NaN.
- The guard returns: `"Current time is not set. Please enter a valid current time."`
- Added two regression tests in `src/utils/availability.test.ts` (lines 94-105):
  - `"rejects a NaN nowMinutes (cleared current-time field)"` — asserts status is `"unavailable"`.
  - `"returns a clear reason when nowMinutes is NaN"` — asserts the reason matches `/current time/i`.

**R-08: Blocked rooms remain visible but cannot be selected**

- Added `disabled={room.blocked}` to the room selection button in `src/App.tsx` (line 165).
- Updated the button className so blocked rooms render with `opacity-60 cursor-not-allowed` styling (lines 171-172), while unblocked rooms retain their existing active/hover styles.
- Blocked rooms remain visible in the room list with their existing "Blocked" badge and lock icon.
- The existing availability-layer safeguard in `checkAvailability` (`src/utils/availability.ts` lines 51-58) remains in place as a second line of defense, returning `"unavailable"` for any blocked room even if the disabled button is bypassed.
- Added one regression test in `src/App.test.tsx` (lines 47-52): `"disables selection of blocked rooms"` — finds the Tesla Lab 2B button and asserts `hasAttribute("disabled")` is `true`. Uses the built-in `.toBe(true)` matcher since `@testing-library/jest-dom` is not installed.

### 7.4 Verification Evidence

The following results were recorded from local verification after remediation:

| Check | Result |
|---|---|
| TypeScript typecheck | PASS |
| ESLint | PASS, with a non-fatal TypeScript compatibility warning |
| Vitest | 4 test files passed, 31/31 tests passed |
| Production build | PASS, with a non-fatal outdated Browserslist database warning |
| Manual UI verification | PASS — Tesla Lab 2B remains visible with "Blocked" badge and cannot be selected; other rooms remain selectable |

Test count increased from 28 (Step 4) to 31 after adding three new regression tests: two for R-05 in `availability.test.ts` and one for R-08 in `App.test.tsx`.

Evidence files from earlier steps remain in the `evidence/` directory. No new screenshots were captured during Practice #10.

### 7.5 Background Agent Experiment

A separate read-only Explore agent was spawned to independently review the R-05 and R-08 remediations. The agent inspected the following files:

- `AGENTS.md`
- `src/App.tsx`
- `src/App.test.tsx`
- `src/utils/availability.ts`
- `src/utils/availability.test.ts`
- `src/data.ts` (for cross-referencing test fixtures)
- `src/types.ts` (for type definitions)

**Findings:**

| Risk | Verdict | Basis |
|---|---|---|
| R-05 | PASS | `Number.isFinite(nowMinutes)` guard at lines 16-18, placed before the past-time check at line 24. Error message names "current time." Two regression tests cover status and reason. |
| R-08 | PASS | `disabled={room.blocked}` at line 165. Blocked rooms remain rendered (filterRooms does not filter by blocked status). `checkAvailability` lines 51-58 still reject blocked rooms as a backend safeguard. Test asserts `hasAttribute("disabled")` is `true`. |
| Behavior preservation | Confirmed | All existing tests for valid inputs, overlaps, past times, duration limits, and blocked-room rejection remain logically consistent. The new NaN guard is additive and cannot affect existing tests since they all pass finite `nowMinutes` values. |

**Limitations:**

- The agent performed static source inspection only. It did not execute tests, typecheck, lint, or build commands.
- Runtime behavior (browser rendering, click-event suppression on disabled buttons) was not observed.
- Verdicts are deductive based on source code reasoning, not empirical test execution results.

**No files were modified, created, or deleted during the background agent experiment.** All activity was read-only.

### 7.6 Repository Readiness and AGENTS.md

A Level 2 repository readiness assessment was conducted. The project includes:

- A local Git repository with an initial commit and subsequent commits for Steps 3 and 4.
- An `AGENTS.md` file providing context for AI-assisted development: project purpose, module responsibilities, key design decisions (strict `HH:mm` parsing, capacity and equipment filtering, immutable booking data), test suite structure, and verification commands.
- Evidence files in the `evidence/` directory documenting build output, typecheck results, lint output, test results, and Git status.

`AGENTS.md` was audited and found consistent with the current source tree. Its test count notes (28 tests, 1 App integration test) are explicitly labeled as a static snapshot taken at Step 4 and are noted as not authoritative after Practice #10 changes. The current test count is 31 across 4 files, with 2 integration tests in `App.test.tsx`.

The local Git repository was present and used throughout the project. It was not absent at any point.

### 7.7 Release Decision

**CONDITIONAL GO**

The remediation of R-05 and R-08 is complete and verified by both local command output and independent static source review. All 31 tests pass, the typecheck is clean, the production build succeeds, and manual UI verification confirms blocked rooms are visible but non-selectable.

The decision is **conditional** rather than unconditional GO due to the following remaining limitations:

1. **R-12 (provisional):** The Browserslist database warning is environment-dependent and has not been independently confirmed or resolved. It is non-fatal and has no functional impact.
2. **ESLint compatibility warning:** A non-fatal TypeScript compatibility warning persists. No forced dependency upgrades were performed, consistent with the project's policy of not upgrading dependencies.
3. **Background agent limitations:** The independent review was static source inspection only and did not execute tests at runtime. Local command output (section 7.4) provides the empirical confirmation, but the agent's verdicts alone are not sufficient.

None of these limitations affect the correctness of the R-05 and R-08 remediations or the existing application behavior. The project is ready for release with the understanding that the two non-fatal warnings are informational and do not impair functionality.
