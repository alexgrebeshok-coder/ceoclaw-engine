# Session 29: Delivery Ledger and Idempotent Execution

## Goal

Make outbound delivery auditable, idempotent, and retry-safe across Telegram, email, and scheduled sends.

This session must produce a working end-to-end flow:

`outbound request -> persisted delivery ledger -> provider execution -> operator-visible delivery state`

## Scope

Work only in the delivery execution slice:

- `prisma/schema.prisma` and `prisma/migrations/**` if a delivery ledger is needed
- `lib/briefs/**`
- `lib/connectors/adapters/telegram.ts`
- `lib/connectors/adapters/email.ts`
- selected routes under `app/api/connectors/**`
- selected operator surfaces under `components/briefs/**`
- focused unit coverage only

## Product intent

The product already has live outbound channels. What is missing is durable execution history and safe retry posture.

This slice must stay honest:

- no fake guaranteed delivery semantics;
- no provider-agnostic abstraction rewrite;
- explicit idempotency and execution history over hidden retries.

## Requirements

1. Persist outbound execution attempts in a delivery ledger.
2. Add idempotency protection for repeated sends.
3. Surface provider result, retry posture, and target in operator-visible state.
4. Keep scheduled delivery flows compatible with the new ledger.
5. Cover one repeat-send and one retry-safe scenario in tests.

## Constraints

1. Do not redesign all brief generation.
2. Do not add multi-provider queueing beyond Telegram and email.
3. Keep one narrow operator UI update.
4. Reuse existing policy and connector flows.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - one Telegram or email send
   - one repeated send proving idempotent handling
   - `/briefs`

## Done when

This session is done when outbound actions are stored as durable delivery records, repeated sends are controlled by idempotent logic, and operators can inspect what happened without digging through logs.
