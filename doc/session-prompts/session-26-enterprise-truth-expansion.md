# Session 26: Enterprise Truth Expansion

## Goal

Extend the evidence-backed model beyond the pilot sources into broader enterprise systems without collapsing the product into a generic integration hub.

This session must produce a working end-to-end flow:

`1C finance + field evidence + fused corroboration + telemetry gaps -> enterprise truth rollup -> operator-visible trust surface`

## Scope

Work only in the enterprise truth read-model slice:

- `lib/enterprise-truth/**`
- narrow route work under `app/api/**`
- selected `components/integrations/**`
- focused planning-copy updates where the product would otherwise understate the new trust layer
- focused unit coverage only

## Product intent

The product already has:

1. live connector reads from GPS and 1C;
2. evidence ledger and cross-source fusion;
3. operator-facing integrations surface.

What is still missing is a higher-order answer to:

- where finance and field truth already corroborate each other;
- where only one side is visible;
- where telemetry activity still has no corroborating field fact.

This slice must stay honest:

- no fake ERP reconciliation engine;
- no universal MDM layer;
- no write-back into 1C or GPS.

## Requirements

1. Derive a read-only enterprise truth rollup from:
   - 1C finance sample;
   - field evidence;
   - fused corroboration;
   - unmatched telemetry.
2. Show project-level status such as:
   - corroborated;
   - finance-only;
   - field-only.
3. Surface unmatched telemetry gaps explicitly.
4. Expose one API endpoint for the rollup.
5. Render one visible operator card on `/integrations`.

## Constraints

1. Do not add new persistence.
2. Do not add write-back semantics.
3. Do not invent project matching beyond deterministic, explainable heuristics.
4. Keep the slice read-only and inspectable.
5. Reuse existing evidence, fusion, GPS, and 1C surfaces.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `GET /api/enterprise-truth`
   - `GET /integrations`

## Done when

This session is done when operators can see which projects already have corroborated enterprise truth, which ones remain one-sided, and which telemetry sessions still lack corroborating field evidence.
