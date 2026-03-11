# Session 31: 1C Financial Truth Deepening

## Goal

Deepen 1C from a narrow finance sample into a more useful project financial truth source for reconciliation.

This session must produce a working end-to-end flow:

`live 1C read -> normalized finance truth -> operator-visible financial deltas`

## Scope

Work only in the 1C truth slice:

- `lib/connectors/one-c-client.ts`
- `lib/connectors/adapters/one-c.ts`
- selected routes under `app/api/connectors/one-c/**`
- selected `components/integrations/**`
- narrow truth-layer helpers that depend directly on 1C entities
- focused unit coverage only

## Product intent

The product already proves 1C live read capability. What is missing is a deeper financial truth model that can be reconciled with field evidence.

This slice must stay honest:

- no 1C write-back;
- no pretend ERP mirror;
- deterministic read-only truth only.

## Requirements

1. Add at least one richer 1C financial view beyond the current sample path.
2. Normalize fields needed for later reconciliation.
3. Surface one operator-facing financial truth view.
4. Keep connector health and sample honesty intact.
5. Preserve read-only semantics.

## Constraints

1. Do not redesign the whole finance layer.
2. Do not build write-back flows.
3. Keep matching rules explainable.
4. Reuse the shared 1C client.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `GET /api/connectors/one-c`
   - one richer 1C read route
   - `/integrations`

## Done when

This session is done when 1C exposes a deeper read-only financial truth slice that later reconciliation can rely on without pretending to be a full ERP replica.
