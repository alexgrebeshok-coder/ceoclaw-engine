# Session 24: Action Safety and Compensation Layer

## Goal

Add explicit safety boundaries for applied AI actions beyond manual approval.

This session must produce a working end-to-end flow:

`proposal type -> safety profile -> apply result -> compensation posture -> operator-visible trace`

## Scope

Work only in the applied-action safety slice:

- `lib/ai/**`
- focused route work under `app/api/ai/**`
- selected `components/work-reports/**`
- narrow planning-copy updates where the product would otherwise overstate execution safety
- focused unit coverage only

## Product intent

The product already has:

1. approval-gated AI proposals;
2. operator trace and provenance;
3. escalation and evidence-backed signal intake.

What is missing is an explicit answer to:

- how risky a proposal is before apply;
- what state the system is in after apply;
- what the operator should do if the applied draft is wrong.

This slice must stay honest:

- no fake rollback engine;
- no hidden automation after apply;
- explicit compensation guidance instead of pretending the product can undo arbitrary actions.

## Requirements

1. Add deterministic safety profiles for proposal types:
   - level;
   - execution mode;
   - mutation surface;
   - preflight checks;
   - compensation mode and steps.
2. Persist safety posture into applied results.
3. Surface safety posture both:
   - before apply;
   - after apply.
4. Update one operator UI slice so the person applying a proposal can see:
   - safety level;
   - execution mode;
   - compensation guidance.
5. Update trace output so post-apply state explains:
   - what happened;
   - what compensation path exists if the operator decides the patch is wrong.

## Constraints

1. Do not build a full rollback engine.
2. Do not introduce new workflow tables.
3. Do not add real downstream execution adapters in this session.
4. Keep safety logic deterministic and explainable.
5. Fix any apply/trace state races discovered while landing this slice.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `POST /api/work-reports/:id/signal-packet`
   - `POST /api/ai/runs/:id/proposals/:proposalId/apply`
   - `GET /api/ai/runs/:id/trace`

## Done when

This session is done when an operator can see an explicit safety posture before applying an AI proposal, see the compensation path after applying it, and the trace stays consistent with the applied state instead of silently dropping it.
