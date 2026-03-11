# Session 17: AI Trace, Provenance, and Eval Harness

## Goal

Make one AI proposal workflow observable, inspectable, and regression-testable.

This session must produce a working end-to-end flow:

`AI run -> trace summary -> operator provenance view -> repeatable eval`

## Scope

Work only in the AI trace slice:

- `prisma/schema.prisma` only if persistence is required
- `prisma/migrations/**` only if persistence is required
- `lib/ai/**`
- `app/api/ai/runs/**`
- one narrow operator surface in `components/**`
- eval fixtures and unit tests only

## Product intent

AI proposals should not be opaque.

The product now needs one narrow but honest trace layer that shows:

1. what facts were loaded;
2. what prompt or packet was built;
3. what step failed or succeeded;
4. what proposal came out;
5. how we can test that quality again later.

## Requirements

1. Pick one existing AI workflow:
   - meeting-to-action;
   - or work-report signal packet.
2. Add a trace summary for that workflow that includes:
   - run identity;
   - source packet or source entity;
   - model and tool step statuses;
   - proposal summary;
   - timestamps and failure details where relevant.
3. Expose the trace through one route such as:
   - `/api/ai/runs/:id/trace`
4. Add one operator-facing panel or detail view for the trace.
5. Add a small eval harness with stable fixtures that checks:
   - proposal schema validity;
   - minimum expected proposal count or type;
   - failure handling for missing context.
6. Keep trace data concise and operator-readable.

## Constraints

1. Do not introduce a large observability platform or vendor dependency.
2. Do not attempt full distributed tracing.
3. Do not broaden the eval harness to every workflow in one session.
4. Prefer replayability and clarity over deep analytics.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - trigger one supported AI run
   - `GET /api/ai/runs/:id`
   - `GET /api/ai/runs/:id/trace`
   - open the operator-facing trace view

## Done when

This session is done when one AI workflow exposes a usable trace and a repeatable eval suite can catch regressions in proposal quality or runtime behavior.
