# Project memory

## Product intent & audience

- Room booking/availability app built with Vite + React (TypeScript).
- Core feature: deterministic room availability/booking engine that produces authoritative availability status, paired with a separate explanation generator that describes the result in natural language.

## Brand personality & voice

- Explanations are concise, factual, and strictly grounded in deterministic checker output.
- Voice avoids speculation; never invents causes/reasons not present in inputs.

## Visual design & UX direction

- Stack: Vite + React + Tailwind CSS + Lucide React icons; `@/` path alias maps to `src/`.
- No additional UI/icon/theme packages unless explicitly requested.
- No direct LLM/external API integration for explanations; all UX text derived locally.

## Decisions, constraints & rationale

- Deterministic availability checker (`src/utils/availability.ts`) is the single source of truth for availability and booking status.
- Explanation layer (`src/utils/explain.ts`) must only describe, never alter, availability or booking state.
- `ExplanationInput` does not include the underlying block reason; blocked-room explanations must not mention "maintenance", "restriction", or any invented cause — only that the room is blocked and the confirmed status is authoritative.
- `validateExplanationOutput` rules:
  - Reject empty output.
  - Enforce max two sentences.
  - Reject conflicting availability claims (e.g. both "free/available" and "unavailable/blocked/overlap/cannot" present), regardless of checker direction.
  - Preserve existing accept behavior for consistent explanations.
- Do not modify `availability.ts`, booking rules, or `REPORT.md`.
- Test command: `npm.cmd test`; typecheck: `npm.cmd run typecheck` (Windows environment).
- Agentic review workflow produces findings in `REPORT.md`; fixes target confirmed findings only and must not edit the report.

## Open questions & assumptions

- Assumed block reasons (e.g. maintenance) may exist upstream but are intentionally excluded from explanation inputs; future need to surface real reasons would require extending `ExplanationInput`, not guessing.
- Conflict detection relies on keyword sets (free/available vs. unavailable/blocked/overlap/cannot); language variations may need tuning if explanation phrasing expands.