# Session 11: First Live Connector Upgrade

## Goal

Upgrade one connector from a pure status stub into a real live probe against an external system.

This session must produce a working end-to-end flow:

`connector registry -> live external health probe -> API status -> integrations UI`

## Scope

Work only in the connector slice:

- `lib/connectors/**`
- `app/api/connectors/**`
- `app/api/health/route.ts`
- `components/integrations/**`
- connector-focused unit tests only

## Product intent

The system should stop pretending every integration is just a placeholder. At least one connector must:

1. validate real credentials;
2. call the external system;
3. expose honest health;
4. show live vs stub state in the UI.

This is not a full sync engine yet. It is a trust-building live integration probe.

## Requirements

1. Pick one connector that already exists in the product and can be upgraded without broad schema changes.
2. Replace the status stub with a live health probe.
3. Return:
   - configured vs missing credentials
   - ok / pending / degraded
   - useful human-readable message
   - optional metadata about the remote system
4. Keep the connector registered through the same registry and API routes.
5. Update `/integrations` so the operator can see which connectors are `Live` and which remain `Stub`.
6. Add unit tests for the live connector probe and update registry/route tests accordingly.

## Constraints

1. Do not introduce queues, sync jobs, or schema changes in this session.
2. Do not broaden the connector abstraction beyond what the current registry needs.
3. Prefer one honest live probe over several fake integrations.
4. If credentials are invalid, surface `degraded` rather than hiding the problem.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `GET /api/connectors`
   - `GET /api/connectors/:id`
   - `GET /api/health`
   - `GET /integrations`

## Done when

This session is done when one connector is clearly no longer a stub and the platform surfaces its real health honestly through API and UI.
