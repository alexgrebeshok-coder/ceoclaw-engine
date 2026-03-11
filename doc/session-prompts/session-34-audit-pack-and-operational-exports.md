# Session 34: Audit Pack and Operational Exports

## Goal

Make evidence, decisions, and applied changes exportable as pilot-grade audit packs.

This session must produce a working end-to-end flow:

`selected project or workflow -> assembled audit pack -> operator-visible export artifact`

## Scope

Work only in the audit/export slice:

- selected routes under `app/api/**`
- selected `components/**`
- narrow export helpers under `lib/**`
- focused planning-copy updates where audit posture would otherwise be overstated
- focused unit coverage only

## Product intent

The product already has traces, evidence, and enterprise truth, but those are still mostly UI-native.

What is missing is an exportable pack for pilot review, audit, and stakeholder handoff.

This slice must stay honest:

- no enterprise document factory;
- deterministic export contents;
- narrow operator value first.

## Requirements

1. Add one exportable audit pack flow.
2. Include at least evidence, run trace, and applied decision context.
3. Surface export scope and generation time clearly.
4. Keep one operator-facing entry point.
5. Make the output stable enough for pilot review.

## Constraints

1. Do not build a full reporting subsystem.
2. Do not depend on office-document generation if not already available.
3. Keep export structure deterministic and inspectable.
4. Reuse existing truth and trace layers.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - generate one audit pack
   - inspect one operator export surface

## Done when

This session is done when a pilot stakeholder can receive one assembled audit pack without relying on manual screenshot collections.
