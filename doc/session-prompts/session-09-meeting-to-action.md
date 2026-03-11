# Session 09: Meeting-to-Action Vertical Slice

## Goal

Implement the first vertical pilot flow that turns meeting notes into actionable AI packets for one project context.

This session must produce a working end-to-end flow:

`meeting notes -> AI runs -> proposals -> apply`

## Scope

Work only in the meeting-to-action slice:

- `app/api/meetings/**`
- `app/meetings/**`
- `components/meetings/**`
- `lib/meetings/**`
- `lib/ai/server-context.ts`
- `lib/validators/meeting-to-action.ts`
- minimal policy/navigation wiring if required

## Product intent

The flow should help a PM or operator paste raw notes from a sync, call, or field update and immediately get:

1. task proposals;
2. risk proposals;
3. status draft;
4. explicit approval/apply path.

This is not a note archive. It is an action-intake surface.

## Requirements

1. Add a backend route that accepts:
   - `projectId`
   - `title`
   - `participants`
   - `notes`
   - optional locale fields
2. Build a server-side AI context from live/mock dashboard data.
3. Launch multiple AI runs on the same project context:
   - task/action run
   - risk run
   - status report run
4. Return one packet object that contains:
   - packet metadata
   - created runs
   - poll paths
5. Add a simple `/meetings` UI page:
   - select project
   - enter meeting title
   - enter participants
   - paste notes
   - launch packet
   - poll run statuses
   - allow applying pending proposals
6. Protect the route with a dedicated platform permission.

## Constraints

1. Do not introduce a second approval engine.
2. Reuse the existing AI run/proposal/apply flow.
3. Do not modify Prisma schema in this session.
4. Keep the UI intentionally simple and operational.
5. Prefer a pilotable flow over a polished note-taking product.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `POST /api/meetings/to-action`
   - poll `/api/ai/runs/:id`
   - `POST /api/ai/runs/:id/proposals/:proposalId/apply`
   - `GET /meetings`

## Done when

This session is done when a user can paste one meeting summary and get a working packet with multiple AI runs and at least one successfully applied proposal.
