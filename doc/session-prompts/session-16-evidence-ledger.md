# Session 16: Evidence Ledger and Verification Status

## Goal

Create the first narrow evidence layer that separates manual reports, observed signals, and verified facts.

This session must produce a working end-to-end flow:

`source fact -> evidence record -> verification status -> operator visibility`

## Scope

Work only in the evidence slice:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `lib/evidence/**`
- `lib/plan-fact/**`
- `app/api/evidence/**`
- one narrow operator surface in `components/**`
- evidence-focused unit tests only

## Product intent

CEOClaw should stop treating every fact as equally trustworthy.

The product now needs one explicit evidence model that can answer:

1. was this fact reported manually;
2. was it observed from a live system;
3. has it been verified strongly enough to influence management actions.

## Requirements

1. Add a narrow persisted evidence model.
2. Evidence records should support at least:
   - `sourceType`;
   - `sourceRef`;
   - `entityType`;
   - `entityRef`;
   - `observedAt`;
   - optional `reportedAt`;
   - `confidence`;
   - `verificationStatus`;
   - compact metadata payload.
3. Integrate one existing fact family with the evidence model:
   - GPS telemetry sample;
   - or work report signal facts.
4. Add an API surface to list or inspect evidence for one entity or packet.
5. Add one operator-facing panel that clearly shows:
   - `reported`;
   - `observed`;
   - `verified`.
6. Keep verification logic narrow and explicit.
7. Add tests for evidence creation, retrieval, and verification-state mapping.

## Constraints

1. Do not build a generic event bus.
2. Do not attempt cross-source fusion in this session.
3. Do not rewrite all fact models to use evidence immediately.
4. Prefer one trustworthy evidence lane over platform-wide speculative abstraction.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - migration apply locally
   - `GET /api/evidence`
   - `GET /api/evidence/:id` or equivalent entity route
   - one operator page that shows evidence states

## Done when

This session is done when one important fact family has evidence records with visible provenance and verification status, and the operator can distinguish reported facts from observed or verified facts.
