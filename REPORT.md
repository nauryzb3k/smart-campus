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

The project will be organized into separate modules:

- Room catalog: `data/rooms.ts`
- Availability logic: `utils/availability.ts`
- Filtering logic: `utils/filters.ts`
- User interface: `App.tsx`

### Design Decisions

**1. Separation of responsibilities**

The application logic will be separated into independent modules to improve maintainability and testability.

**2. Immutable booking data**

Availability checks must not modify existing room bookings. This protects the original data and prevents unintended side effects.

## 3. Initial Verification

| Check | Initial result |
|---|---|
| Production build | Passed |
| ESLint | Passed with compatibility warning |
| TypeScript typecheck | Passed |
| Automated tests | Not configured |

## 4. Room Catalog Extension

The initial room catalog was extended with an `equipment` array for each of the five rooms.

Each room now contains equipment information, allowing the application to support equipment-based filtering.

### Verification

- TypeScript typecheck: Passed.
- Production build: Passed.
- Existing room bookings were preserved.

### Filtering Module

A separate filtering module (`src/utils/filters.ts`) was implemented.

It supports:
- Minimum room capacity filtering.
- Equipment filtering requiring all selected equipment items.

The filtering function uses array filtering and does not modify the original room catalog.




