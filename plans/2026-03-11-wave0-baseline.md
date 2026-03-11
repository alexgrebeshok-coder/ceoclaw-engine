# Wave 0 Baseline

**Date:** 2026-03-11
**Status:** Core stabilization complete

## Completed in this pass

### 1. Build baseline is green

Verified:
- `npm run build`

Result:
- production build completes successfully.

### 2. Unit tests are now real unit tests

Before:
- `test:unit` executed every `lib/__tests__/*.test.ts` file;
- many of those files called `http://localhost:3000`;
- some of them logged failures without failing the process.

Now:
- `test:unit` runs only explicit assertion-based unit tests via [run-unit-tests.sh](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/scripts/run-unit-tests.sh)
- added:
  - [intent-parser.unit.test.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/lib/__tests__/intent-parser.unit.test.ts)
  - [command-handler.unit.test.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/lib/__tests__/command-handler.unit.test.ts)
  - [runtime-mode.unit.test.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/lib/__tests__/runtime-mode.unit.test.ts)

Verified:
- `npm run test:unit`

### 3. Runtime mode is explicit

Added:
- [runtime-mode.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/lib/server/runtime-mode.ts)

Supported modes:
- `APP_DATA_MODE=auto`
- `APP_DATA_MODE=demo`
- `APP_DATA_MODE=live`

Rules:
- `auto`: use DB if configured, otherwise mock data;
- `demo`: always use mock data;
- `live`: require DB and do not silently fall back to mock data.

### 4. Health endpoint exposes runtime state

Updated:
- [route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/health/route.ts)

Now returns:
- `status`
- `timestamp`
- `version`
- `runtime.dataMode`
- `runtime.databaseConfigured`
- `runtime.usingMockData`

### 5. Core API routes no longer hide arbitrary failures behind mock fallbacks

Updated:
- [projects/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/projects/route.ts)
- [tasks/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/tasks/route.ts)
- [overview/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/analytics/overview/route.ts)
- [predictions/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/analytics/predictions/route.ts)
- [recommendations/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/analytics/recommendations/route.ts)
- [team-performance/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/analytics/team-performance/route.ts)
- [projects/[id]/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/projects/[id]/route.ts)
- [boards/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/boards/route.ts)
- [boards/[id]/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/boards/[id]/route.ts)
- [gantt/dependencies/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/gantt/dependencies/route.ts)
- [tasks/[id]/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/tasks/[id]/route.ts)
- [tasks/[id]/move/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/tasks/[id]/move/route.ts)
- [tasks/[id]/reschedule/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/tasks/[id]/reschedule/route.ts)
- [tasks/reorder/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/tasks/reorder/route.ts)
- [tasks/[id]/dependencies/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/tasks/[id]/dependencies/route.ts)
- [tasks/[id]/dependencies/[dependencyId]/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/tasks/[id]/dependencies/[dependencyId]/route.ts)
- [calendar/events/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/calendar/events/route.ts)
- [risks/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/risks/route.ts)
- [risks/[id]/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/risks/[id]/route.ts)
- [team/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/team/route.ts)
- [team/[id]/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/team/[id]/route.ts)
- [notifications/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/notifications/route.ts)
- [notifications/[id]/read/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/notifications/[id]/read/route.ts)
- [notifications/check-due-dates/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/notifications/check-due-dates/route.ts)
- [time-entries/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/time-entries/route.ts)
- [time-entries/[id]/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/time-entries/[id]/route.ts)
- [time-entries/stats/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/time-entries/stats/route.ts)
- [milestones/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/milestones/route.ts)
- [milestones/[id]/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/milestones/[id]/route.ts)
- [documents/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/documents/route.ts)
- [documents/[id]/route.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/app/api/documents/[id]/route.ts)

Behavior now:
- mock responses are chosen intentionally via runtime mode;
- `live` mode without DB returns `503 DATABASE_UNAVAILABLE`;
- unexpected runtime errors return structured server errors instead of mock payloads.
- `app/api` no longer contains direct `process.env.DATABASE_URL` checks.

### 6. Command handler became unit-testable

Updated:
- [command-handler.ts](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/lib/command-handler.ts)

Change:
- `executeCommand()` now accepts an injected client, so command logic can be tested without a live HTTP server.

## Smoke verification

Verified manually against local production server on port `3010`:
- `GET /api/health`
- `GET /api/projects`
- `GET /api/projects/:existingId`
- `GET /api/tasks`
- `GET /api/tasks/:existingId`
- `GET /api/analytics/overview`
- `GET /api/analytics/recommendations`
- `GET /api/boards`
- `GET /api/tasks/:existingId/dependencies`

Observed:
- all returned `200`;
- health returned `dataMode=auto`, `databaseConfigured=true`, `usingMockData=false`;
- detail routes returned populated project/task payloads when exercised with live IDs from the current database.

## Remaining non-blocking debt

### 1. Legacy HTTP-style tests still live under `lib/__tests__`

Examples:
- analytics UI/API smoke scripts;
- calendar smoke scripts;
- task dependency scripts;
- notification scripts;
- webhook scripts.

They are no longer part of `test:unit`, but they still need proper reclassification later.

Explicit runner added:
- [run-legacy-http-tests.sh](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/scripts/run-legacy-http-tests.sh)

Package script:
- `npm run test:legacy:http`

### 2. Some API routes still use legacy fallback behavior

Main remaining cleanup is narrower now:
- standardizing older routes that still return ad hoc error payloads instead of shared API error helpers;
- deciding whether demo-mode mutation responses should become richer stateful fixtures or stay lightweight;
- documenting runtime mode usage for developers and operators.

### 3. Lint noise remains

Build passes, but there are still multiple warnings:
- unused imports;
- unused variables;
- `any` usage;
- a few hook dependency warnings.

### 4. Demo vs live mode is not yet surfaced in the UI

The server now knows the mode explicitly, but UI and settings do not yet explain or enforce it consistently.

## Recommended next step

Start `Wave 1` with parallel implementation sessions while keeping one integration pass reserved for merge/verification:
- Session 01: import pipeline;
- Session 02: AI action engine;
- Session 03: executive briefs;
- optional Session 04 after that: work reports / Telegram intake.
