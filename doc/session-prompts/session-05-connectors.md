# Session 05: Connector Framework

## Mission

Создать в CEOClaw каркас connector layer для внешних источников данных и действий:
- 1C
- GPS
- Telegram
- Email

Сейчас без deep implementation. Нужны contracts, registry, health checks, stub adapters.

## Reuse Sources

- AI-PMO integration specs по 1C / GPS
- текущий Telegram webhook в CEOClaw
- текущий dashboard client

## Allowed Files

- `lib/connectors/*`
- `lib/connectors/**/*`
- `app/api/connectors/**/*`
- `app/api/health/route.ts`
- `lib/__tests__/connectors*.test.ts`

## Forbidden Files

- `prisma/schema.prisma`
- `components/dashboard-provider.tsx`
- `lib/ai/*`
- `lib/import/*`

## Deliverables

1. connector interface
2. registry
3. stub adapters:
   - `telegram`
   - `email`
   - `gps`
   - `one-c`
4. health endpoint for connector status
5. tests for registry and adapter contracts

## Success Criteria

1. Каждому коннектору можно запросить status.
2. Можно зарегистрировать и получить connector by id.
3. Telegram connector не ломает существующий webhook.

## Verification

- unit tests
- smoke JSON responses

## Output Format

В конце сессии вернуть:
- какие коннекторы созданы;
- где нужны реальные credentials и secrets;
- какие API surface подготовлены.
