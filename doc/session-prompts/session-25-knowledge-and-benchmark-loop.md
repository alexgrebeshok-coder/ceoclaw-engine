# Session 25: Knowledge and Benchmark Loop

## Goal

Turn repeated operating patterns into reusable playbooks, lessons, and benchmark-guided recommendations.

This session must produce a working end-to-end flow:

`escalation history -> repeated pattern grouping -> reusable playbook -> benchmark-guided guidance -> operator-visible knowledge loop`

## Scope

Work only in the derived knowledge slice:

- `lib/knowledge/**`
- narrow read-only route work under `app/api/briefs/**`
- selected `components/briefs/**`
- focused planning-copy updates where the product would otherwise understate reusable operator knowledge
- focused unit coverage only

## Product intent

The product already has:

1. evidence-backed escalations;
2. proposal safety and traceability;
3. operator-facing executive briefs.

What is still missing is a reusable answer to:

- which escalation patterns keep repeating;
- how quickly those patterns should be acknowledged;
- what the next operator move should look like when the pattern reappears.

This slice must stay honest:

- no fake ML ranking;
- no new persistence layer for "knowledge objects";
- deterministic grouping and benchmark derivation from the live escalation queue only.

## Requirements

1. Derive reusable playbooks from repeated escalation patterns.
2. Attach benchmark guidance such as:
   - acknowledgment window;
   - resolution rate;
   - breach rate;
   - likely owner role.
3. Surface lessons and compensation posture based on existing safety profiles.
4. Show one visible knowledge loop on the operator surface.
5. Expose one read-only API endpoint so the same layer is inspectable without the UI.

## Constraints

1. Do not create new database tables.
2. Do not invent a standalone knowledge-management subsystem.
3. Do not make the knowledge loop available in demo mode as if it were live history.
4. Keep all guidance deterministic and explainable.
5. Reuse escalation history and proposal safety metadata that already exist.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `GET /api/briefs/knowledge`
   - `GET /briefs`

## Done when

This session is done when executive/operator users can inspect reusable playbooks and benchmark-guided guidance derived from live escalation history, and the product stays honest about that layer being unavailable outside live operator data mode.
