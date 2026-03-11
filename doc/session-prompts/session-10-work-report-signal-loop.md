# Session 10: Work Report -> Signal -> Action Loop

## Goal

Implement the second vertical pilot flow that turns one field work report into a signal packet and actionable AI runs for one project context.

This session must produce a working end-to-end flow:

`work report -> signal packet -> AI runs -> proposals -> apply`

## Scope

Work only in the work-report signal slice:

- `app/api/work-reports/[id]/signal-packet/**`
- `components/work-reports/**`
- `lib/work-reports/**`
- `lib/validators/work-report-signal-packet.ts`
- minimal plan/brief/alert reuse only when needed

## Product intent

The flow should help a PM or operator take one field report from the site and immediately convert it into:

1. execution patch tasks;
2. risk additions;
3. executive status draft;
4. explicit approval/apply path.

This is not just report storage. It is the handoff from field facts into management action.

## Requirements

1. Add a backend route that accepts:
   - `reportId` via route param
   - optional locale fields
2. Load the selected work report from the live backend.
3. Build a signal snapshot from:
   - work report facts
   - project executive snapshot
   - plan-vs-fact summary
   - top project alerts
4. Launch multiple AI runs on the same project context:
   - tasks/action run
   - risk run
   - status report run
5. Return one packet object that contains:
   - packet metadata
   - signal snapshot
   - created runs
   - poll paths
6. Add a simple UI surface on `/work-reports`:
   - pick a non-rejected report
   - create packet
   - inspect signal summary and top alerts
   - poll run statuses
   - allow applying pending proposals
7. Protect the route with an existing review-level work report permission.

## Constraints

1. Do not introduce a new approval engine.
2. Reuse the existing AI run/proposal/apply flow.
3. Do not modify Prisma schema in this session.
4. Do not turn the reports table into a heavy interactive grid.
5. Prefer a pilotable field-to-action loop over a full reporting product.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `GET /api/work-reports`
   - `POST /api/work-reports/:id/signal-packet`
   - poll `/api/ai/runs/:id`
   - `POST /api/ai/runs/:id/proposals/:proposalId/apply`
   - `GET /work-reports`

## Done when

This session is done when a user can pick one field report and get a working packet with project signals, multiple AI runs, and at least one successfully applied proposal.
