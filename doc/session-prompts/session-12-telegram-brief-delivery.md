# Session 12: Telegram Brief Delivery Channel

## Goal

Implement the first outbound delivery channel that turns a generated executive brief into a Telegram message.

This session must produce a working end-to-end flow:

`brief generator -> Telegram delivery preview -> Telegram send`

## Scope

Work only in the executive brief delivery slice:

- `lib/briefs/**`
- `lib/connectors/telegram-client.ts`
- `app/api/connectors/telegram/briefs/**`
- `components/briefs/**`
- minimal policy updates if required

## Product intent

The system should not stop at generating text. A PM or executive should be able to:

1. preview a portfolio or project brief as a Telegram digest;
2. send it into a real chat;
3. see delivery errors honestly.

This is not scheduling yet. It is the first live outbound comms path.

## Requirements

1. Add a Telegram delivery service that:
   - loads a portfolio or project brief
   - uses the existing brief formats.telegramDigest output
   - supports dry-run preview
   - supports real send to Telegram
2. Add a backend route that accepts:
   - `scope`
   - optional `projectId`
   - optional `locale`
   - optional `chatId`
   - optional `dryRun`
3. Reuse a shared Telegram client instead of duplicating Bot API calls in routes.
4. Add a delivery panel to `/briefs`:
   - choose portfolio vs project scope
   - choose locale
   - optional chat id
   - preview
   - send
5. Protect the route with a dedicated outbound permission.

## Constraints

1. Do not add scheduling or background jobs in this session.
2. Do not change Prisma schema.
3. Prefer one honest delivery path over a broad notification framework.
4. Delivery errors must surface clearly instead of being swallowed.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `POST /api/connectors/telegram/briefs` with `dryRun=true`
   - `POST /api/connectors/telegram/briefs` without `chatId` to verify validation
   - `GET /briefs`

## Done when

This session is done when a user can preview a current executive brief as a Telegram message and the system is capable of sending it through the Telegram connector when credentials and chat target are valid.
