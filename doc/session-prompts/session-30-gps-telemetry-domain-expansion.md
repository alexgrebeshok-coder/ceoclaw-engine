# Session 30: GPS Telemetry Domain Expansion

## Goal

Expand GPS from a narrow sample read into a richer telemetry truth domain that other reconciliation layers can trust.

This session must produce a working end-to-end flow:

`live GPS read -> normalized telemetry entities -> operator-visible telemetry truth`

## Scope

Work only in the GPS truth slice:

- `lib/connectors/gps-client.ts`
- `lib/connectors/adapters/gps.ts`
- selected routes under `app/api/connectors/gps/**`
- selected `components/integrations/**`
- narrow truth-layer helpers that depend directly on GPS entities
- focused unit coverage only

## Product intent

The product already proves GPS live readiness and sample reads. What is missing is a richer telemetry shape that can support reconciliation.

This slice must stay honest:

- no fake full sync engine;
- no write-back;
- deterministic normalized entities only.

## Requirements

1. Add at least one richer GPS entity or view beyond the current sample snapshot.
2. Normalize telemetry fields so they can be linked by later truth layers.
3. Surface one operator-facing telemetry truth view.
4. Keep live probe honesty intact.
5. Preserve narrow read-only semantics.

## Constraints

1. Do not build a general telemetry warehouse.
2. Do not invent unsupported GPS semantics.
3. Keep the slice read-only and explainable.
4. Reuse the shared GPS client.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `GET /api/connectors/gps`
   - one richer GPS read route
   - `/integrations`

## Done when

This session is done when GPS contributes richer normalized telemetry truth than a one-off sample card, while staying read-only and honest about what the provider actually returns.
