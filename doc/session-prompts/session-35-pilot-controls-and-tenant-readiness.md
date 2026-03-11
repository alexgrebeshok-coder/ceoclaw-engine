# Session 35: Pilot Controls and Tenant Readiness

## Goal

Make the product safer to run in real pilots across tenants, workspaces, and environments.

This session must produce a working end-to-end flow:

`pilot configuration -> guarded environment behavior -> operator-visible rollout posture`

## Scope

Work only in the pilot-control slice:

- selected policy/runtime files under `lib/server/**`
- selected route guards under `app/api/**`
- selected operator surfaces under `components/**`
- narrow planning-copy updates where rollout safety would otherwise be overstated
- focused unit coverage only

## Product intent

The product already distinguishes live, demo, mixed, and degraded states. What is missing is a clearer pilot-safe rollout model across tenants and workspaces.

This slice must stay honest:

- no premature multi-tenant platform rewrite;
- narrow pilot controls first;
- explicit rollout posture over hidden flags.

## Requirements

1. Add one coherent pilot-control model tied to runtime and workspace behavior.
2. Surface rollout posture clearly to operators.
3. Guard the highest-risk live workflows with tenant- or workspace-safe rules.
4. Keep the initial configuration narrow and explainable.
5. Cover one live-safe and one blocked scenario in tests.

## Constraints

1. Do not build a generic SaaS admin console.
2. Do not redesign the whole policy model.
3. Keep pilot controls explicit and operator-visible.
4. Reuse existing runtime truth and policy helpers.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - one pilot-safe live workflow
   - one blocked workflow in the wrong rollout posture

## Done when

This session is done when a real pilot can be configured with explicit rollout posture and the product visibly enforces the highest-risk boundaries.
