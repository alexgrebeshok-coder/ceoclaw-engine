# Session 33: Executive Command Center and Exception Inbox

## Goal

Unify operator follow-through around one exception-driven command model instead of page-by-page chasing.

This session must produce a working end-to-end flow:

`truth gap or escalation -> exception inbox -> owner follow-through -> closure state`

## Scope

Work only in the operator command slice:

- selected `components/**`
- selected route/page assembly files under `app/**`
- narrow supporting read models under `lib/**`
- focused planning-copy updates where the product would otherwise overstate control coherence
- focused unit coverage only

## Product intent

The product already has escalations, enterprise truth, and delivery surfaces. What is missing is one operator-first command surface.

This slice must stay honest:

- no fake unified ERP cockpit;
- one narrow command center first;
- exception-driven follow-through over page sprawl.

## Requirements

1. Add one shared command center or exception inbox.
2. Include owned workload from at least two existing truth/control layers.
3. Surface urgency, owner, source, and next action clearly.
4. Keep links back to source detail views.
5. Preserve existing operator routes while adding the shared surface.

## Constraints

1. Do not redesign the whole app shell.
2. Do not duplicate every page into the new surface.
3. Keep the slice executive/operator-focused, not analytics-heavy.
4. Reuse existing escalation and truth services.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - the new command-center route or panel
   - at least one linked source workflow

## Done when

This session is done when an operator can manage the highest-priority exceptions from one place and still drill back to the source evidence or workflow.
