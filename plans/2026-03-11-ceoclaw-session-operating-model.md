# CEOClaw Session Operating Model

**Date:** 2026-03-11
**Status:** Active

## 1. Working Modes

There are two valid ways to work on CEOClaw.

### Mode A: Lead-only sequential

Use this when:
- repo stability is uncertain;
- a change crosses multiple layers;
- schema and policy are moving;
- we need clean integration more than raw speed.

### Mode B: Lead + worker sessions

Use this when:
- the current wave has isolated file zones;
- prompt files clearly separate ownership;
- build baseline is already stable;
- merge cost is acceptable.

## 2. Recommended Mode by Phase

### Right now

Use `Mode A` first.

Reason:
- build is not stable enough yet;
- test boundaries are not clean;
- mock vs production behavior is still fuzzy.

### After Wave 0

Switch to `Mode B`.

Recommended concurrency:
- 2 sessions minimum if you want acceleration;
- 3 sessions maximum per wave for now.

## 3. Session Roles

### Lead session

Responsibilities:
- master plan;
- repo stabilization;
- cross-cutting changes;
- merge review;
- final verification;
- wave transitions.

This should be my role.

### Worker session

Responsibilities:
- execute one scoped prompt;
- stay within allowed files;
- run local verification;
- return a concise completion report.

## 4. Session Lifecycle

1. Pick the current wave.
2. Pick one prompt file.
3. Start one session with that prompt and no extra side missions.
4. Session completes its local scope.
5. Session returns:
   - changed files;
   - tests run;
   - blockers;
   - assumptions;
   - follow-up needed from integration.
6. Lead session reviews and integrates.
7. Only then start the next wave.

## 5. What You Should Paste Into Worker Sessions

Use exactly one of the files from:

- [session-01-import-pipeline.md](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/doc/session-prompts/session-01-import-pipeline.md)
- [session-02-ai-action-engine.md](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/doc/session-prompts/session-02-ai-action-engine.md)
- [session-03-executive-briefs.md](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/doc/session-prompts/session-03-executive-briefs.md)
- [session-04-work-reports.md](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/doc/session-prompts/session-04-work-reports.md)
- [session-05-connectors.md](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/doc/session-prompts/session-05-connectors.md)
- [session-06-ui-shell.md](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/doc/session-prompts/session-06-ui-shell.md)
- [session-07-org-workspace-policy.md](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/doc/session-prompts/session-07-org-workspace-policy.md)
- [session-08-plan-vs-fact.md](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/doc/session-prompts/session-08-plan-vs-fact.md)
- [session-09-meeting-to-action.md](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/doc/session-prompts/session-09-meeting-to-action.md)
- [session-13-scheduled-digests.md](/Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test/doc/session-prompts/session-13-scheduled-digests.md)

Do not combine prompt files in one worker session.

## 6. Rules for Running Parallel Sessions

1. Maximum three worker sessions at once.
2. One session per prompt file.
3. No overlapping ownership of `prisma/schema.prisma`.
4. No overlapping ownership of the same API subtree.
5. No worker session should rewrite unrelated tests or layout files.
6. Lead session always merges; workers do not self-integrate across waves.

## 7. Best Launch Pattern

### Stage 1

Only one session:
- lead session closes Wave 0.

### Stage 2

Wave 1 is complete on the lead branch:
- Session 01;
- Session 02;
- Session 03.

### Stage 3

Wave 2 worker batch:
- Session 05;
- Session 06.

### Stage 4

Lead session merges and repairs integration issues.
Status: complete on 2026-03-11. Imports, briefs, work reports, and integrations UI now target live backend contracts.

### Stage 5

Run Session 07 first.
Status: complete on 2026-03-11. Organization/workspace/membership schema landed, preferences are role-gated, and Wave 2 API routes now use the shared access helper.

### Stage 6

Run Session 08 after Session 07 lands or in controlled overlap if schema is untouched.
Status: complete on 2026-03-11. Lead track landed shared plan-vs-fact services, new `/api/analytics/plan-fact`, and live integration into overview, predictions, recommendations, and brief generation.

### Stage 7

Repeat the same pattern for the next wave: workers implement in isolated zones, lead session integrates and verifies.
Status: Session 09, Session 10, Session 11, Session 12, Session 13, and Session 14 are complete on 2026-03-11. Meeting-to-action, work-report signal packets, Telegram live probing, Telegram brief delivery, scheduled Telegram digest policies, and GPS live datasource probing now work on the lead branch, so the next worker batch can move toward the first honest telemetry ingestion slice instead of another status-only connector pass.

## 8. When Not to Parallelize

Do not parallelize when:
- the same files are being edited;
- build is red for unknown reasons;
- schema is changing broadly;
- auth/policy are in flux;
- the previous wave is not yet merged.

## 9. When I Can Work Without Your Constant Control

I can safely drive work without constant intervention when:
- we are inside one clearly scoped wave;
- the prompt and goal are already fixed;
- no product-level decision is blocked;
- there is no conflict with your own in-progress edits.

That means:
- yes, I can keep moving sequentially on the lead track;
- yes, I can prepare prompts, plans, integration rules, and repo cleanup;
- yes, I can usually continue implementation until a real product choice or conflict appears.

## 10. What I Recommend You Do

Right now:

1. Wave 0 no longer blocks parallel execution.
2. Wave 1 is complete on the lead branch.
3. Session 04 is complete on the lead branch.
4. Session 05 and Session 06 have been integrated on the lead branch.
5. Wave 2 is complete.
6. Session 07 is complete on the lead branch.
7. Session 08 is complete on the lead branch.
8. Session 09 is complete on the lead branch.
9. Session 10 is complete on the lead branch.
10. Session 11 is complete on the lead branch.
11. Session 12 is complete on the lead branch.
12. Session 13 is complete on the lead branch.
13. Session 14 is complete on the lead branch.
14. Keep this session as the integration track for the first telemetry ingestion slice or another narrow connector deepening pass.

## 11. Success Condition for This Operating Model

This model is working if:
- workers stop stepping on each other;
- each wave lands cleanly;
- integration time is less than implementation time;
- we are shipping product layers, not just collecting partial code.
