# Session 15: GPS Read-Only Telemetry Ingestion

## Goal

Upgrade GPS/GLONASS from a readiness-only connector into the first honest live telemetry read slice.

This session must produce a working end-to-end flow:

`GPS API -> shared client -> normalized telemetry read route -> operator-facing evidence sample`

## Scope

Work only in the GPS telemetry slice:

- `lib/connectors/**`
- `lib/connectors/gps-client.ts`
- `app/api/connectors/gps/**`
- `components/integrations/**`
- connector-focused unit and route tests only

## Product intent

The product already knows whether GPS responds. It does not yet know anything useful from GPS.

This session should add the smallest valuable step after a live probe:

1. one real read-only route;
2. one normalized telemetry payload;
3. one visible operator sample that proves real data can enter the system.

## Requirements

1. Keep the existing health probe intact.
2. Add one read-only GPS route, such as:
   - `/api/connectors/gps/sample`
   - or `/api/connectors/gps/sessions`
3. Reuse the shared GPS client rather than duplicating HTTP logic.
4. Normalize a minimal payload that includes:
   - `source`;
   - `equipmentId` or equipment summary;
   - `startedAt`;
   - `endedAt`;
   - `durationMinutes` or similar;
   - `status`;
   - a small set of provider counters or metadata.
5. Surface the read result in an operator-friendly place on `/integrations` or the connector detail view.
6. Keep response honesty:
   - `pending` when credentials are missing;
   - `degraded` when the remote system responds badly;
   - `ok` only when a valid sample is returned.
7. Add unit tests for sample parsing and update connector route coverage.

## Constraints

1. Do not introduce Prisma schema changes in this session.
2. Do not build a background sync engine.
3. Do not add write-back or control semantics.
4. Do not invent telemetry fields that the configured GPS endpoint does not actually provide.
5. Prefer one honest sample read over a broad but shallow connector API surface.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `GET /api/connectors/gps`
   - `GET /api/connectors/gps/sample` or the chosen read route
   - `GET /api/connectors`
   - `GET /integrations`

## Done when

This session is done when the operator can see real GPS telemetry facts through API and UI, and the connector remains explicit about whether it is healthy, missing configuration, or degraded.
