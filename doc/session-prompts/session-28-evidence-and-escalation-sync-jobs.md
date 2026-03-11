# Session 28: Evidence and Escalation Sync Jobs

## Goal

Move critical evidence and escalation derivation out of operator read paths into explicit sync jobs or outbox-style execution.

This session must produce a working end-to-end flow:

`source change -> sync trigger -> persisted derivation -> operator read`

## Scope

Work only in the derivation and sync slice:

- `prisma/schema.prisma` only if a narrow job ledger is required
- `prisma/migrations/**` if needed
- `lib/evidence/**`
- `lib/escalations/**`
- selected runtime/job helpers under `lib/server/**`
- narrow route updates under `app/api/evidence/**` and `app/api/escalations/**`
- focused unit coverage only

## Product intent

The product already has evidence and escalation layers, but they still derive too much truth during reads.

What is missing is explicit freshness, idempotency, and diagnosable derivation.

This slice must stay honest:

- no full queue platform;
- no invisible background magic;
- surface sync status and lag clearly.

## Requirements

1. Introduce explicit derivation boundaries for evidence and escalation sync.
2. Make repeated syncs idempotent.
3. Surface freshness or last-sync metadata to operators.
4. Keep existing operator views working without forcing every page load to create truth.
5. Cover one happy path and one retry-safe path in tests.

## Constraints

1. Do not broaden this into general workflow orchestration.
2. Do not add fake always-on workers if the environment does not support them.
3. Keep route contracts narrow and explainable.
4. Reuse existing evidence and escalation models where possible.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - trigger or invoke the new sync boundary
   - `GET /api/evidence`
   - `GET /api/escalations`

## Done when

This session is done when evidence and escalation reads no longer need to silently derive critical truth on every request, and operators can inspect freshness explicitly.
