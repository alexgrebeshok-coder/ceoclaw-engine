# Session 27: AI Run Persistence and Workflow Ledger

## Goal

Move AI runs, packet state, apply state, and trace metadata from file cache into durable database truth.

This session must produce a working end-to-end flow:

`run request -> persisted workflow ledger -> proposal/apply state -> trace retrieval`

## Scope

Work only in the durable workflow state slice:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `lib/ai/**`
- narrow route work under `app/api/ai/**`
- focused planning-copy updates where the product would otherwise overstate durability
- focused unit coverage only

## Product intent

The product already has:

1. working AI runs and proposal/apply flow;
2. trace and eval coverage for one operator workflow;
3. operator-facing trace panels.

What is missing is durable workflow truth that survives process restarts and partial failures.

This slice must stay honest:

- no full job orchestrator yet;
- no speculative multi-agent runtime;
- preserve existing operator APIs where possible.

## Requirements

1. Add persistent storage for AI runs and trace-critical metadata.
2. Stop treating `.ceoclaw-cache` as the canonical source for live workflow state.
3. Preserve proposal state transitions and applied result history.
4. Keep one compatibility path for existing trace routes and operator panels.
5. Add migration-safe tests for the new persistence path.

## Constraints

1. Do not redesign the whole AI engine.
2. Do not add broad background job infrastructure in this session.
3. Keep the first migration narrow and auditable.
4. Avoid route contract churn unless required for correctness.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `POST /api/ai/runs`
   - `GET /api/ai/runs/:id`
   - `GET /api/ai/runs/:id/trace`

## Done when

This session is done when one live AI workflow can be created, read, and traced from durable storage without depending on file cache as the canonical ledger.
