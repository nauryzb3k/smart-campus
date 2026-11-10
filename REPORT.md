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

- `availability.test.ts` — 12 tests.
- `booking.test.ts` — 9 tests.
- `filters.test.ts` — 6 tests.
- `App.test.tsx` — 1 integration test.

**Latest test result: 28/28 tests passed across 4 test files.**

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
