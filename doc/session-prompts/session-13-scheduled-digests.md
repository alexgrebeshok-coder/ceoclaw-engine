# Session 13: Scheduled Executive Digests and Delivery Policies

## Goal

Extend the first Telegram outbound path into a real scheduled delivery slice:

`brief generator -> persisted delivery policy -> cron run -> Telegram digest`

## Scope

Work only in the scheduled digest slice:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `lib/briefs/**`
- `lib/validators/**`
- `app/api/connectors/telegram/briefs/policies/**`
- `components/briefs/**`
- minimal policy updates if required

## Product intent

Telegram preview/send is not enough if executives must manually trigger every digest.

The product now needs:

1. persisted delivery policies for executive digests;
2. a cron-safe route that executes only due policies;
3. operator visibility into what is scheduled, what last ran, and what failed.

Keep this honest and narrow:
- Telegram only;
- executive briefs only;
- daily or weekday cadence is enough;
- no generic orchestration framework.

## Requirements

1. Add a persisted Telegram digest policy model.
2. Support policy fields for:
   - `scope`;
   - optional `projectId`;
   - `locale`;
   - optional `chatId`;
   - `cadence`;
   - `timezone`;
   - `deliveryHour`;
   - `active`;
   - last delivery state.
3. Add policy APIs:
   - list policies;
   - create policy;
   - update policy state or schedule fields.
4. Add a cron-safe route that:
   - authenticates like the existing due-date cron route;
   - selects due policies;
   - calls the existing Telegram brief delivery service;
   - records success or failure.
5. Add an operator panel on `/briefs` to:
   - create a scheduled Telegram digest policy;
   - view active and paused policies;
   - pause or resume a policy.

## Constraints

1. Do not introduce email scheduling in this session.
2. Do not build a broad notification engine.
3. Reuse the current Telegram delivery path instead of duplicating send logic.
4. Delivery failures must remain visible in policy state and API responses.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `GET /api/connectors/telegram/briefs/policies`
   - `POST /api/connectors/telegram/briefs/policies`
   - `POST /api/connectors/telegram/briefs/policies/run-due`
   - `GET /briefs`

## Done when

This session is done when an operator can save a scheduled Telegram digest policy, the backend can execute due policies through a cron-safe route, and `/briefs` shows live policy state on top of the existing manual Telegram send path.
