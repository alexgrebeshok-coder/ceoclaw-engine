# Session 32: Reconciliation Casefile and Fact Linking

## Goal

Create a durable, inspectable reconciliation casefile that links finance, telemetry, work reports, and video evidence.

This session must produce a working end-to-end flow:

`linked source facts -> reconciliation casefile -> operator-visible gaps and corroboration`

## Scope

Work only in the reconciliation slice:

- `prisma/schema.prisma` and `prisma/migrations/**` if the casefile needs persistence
- `lib/evidence/**`
- `lib/enterprise-truth/**`
- selected linking helpers in adjacent truth modules
- narrow routes under `app/api/**`
- one selected operator surface
- focused unit coverage only

## Product intent

The product already has evidence, fusion, and enterprise truth rollups. What is missing is an inspectable case-level object for mismatches and corroboration.

This slice must stay honest:

- no magical universal master data layer;
- deterministic linking and mismatch reasons;
- narrow wedge first.

## Requirements

1. Introduce a casefile or equivalent linked truth object.
2. Link at least finance, telemetry, and field evidence.
3. Surface why facts are corroborated, partial, or contradictory.
4. Expose one API route and one operator view for unresolved cases.
5. Keep linking logic explainable and testable.

## Constraints

1. Do not build a generic enterprise integration hub.
2. Do not add opaque ML matching.
3. Keep the first casefile scope narrow and deterministic.
4. Reuse existing truth layers where possible.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - one reconciliation route
   - one operator-facing casefile view

## Done when

This session is done when operators can inspect a concrete reconciliation case instead of inferring gaps from disconnected rollups.
