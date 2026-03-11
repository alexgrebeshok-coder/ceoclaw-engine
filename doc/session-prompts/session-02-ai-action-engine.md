# Session 02: AI Action Engine Generalization

## Mission

Обобщить текущий AI proposal/apply flow CEOClaw так, чтобы он работал не только для `create_tasks`, а стал базовым action engine для agent layer.

## Reuse Sources

- текущие файлы CEOClaw в `lib/ai/*`
- AI-PMO принцип `AI рекомендует, человек решает`

## Allowed Files

- `lib/ai/*`
- `lib/ai/**/*`
- `app/api/ai/**/*`
- `components/ai/*`
- `lib/__tests__/ai*.test.ts`
- `lib/__tests__/command-handler.test.ts`

## Forbidden Files

- `prisma/schema.prisma`
- `components/dashboard-provider.tsx`
- `lib/import/*`
- `app/api/import/*`

## Deliverables

1. расширенные типы proposal/action:
   - `create_tasks`
   - `update_tasks`
   - `reschedule_tasks`
   - `raise_risks`
   - `draft_status_report`
   - `notify_team`
2. единый proposal reducer / apply handler
3. `needs_approval` flow с нормальным result payload
4. тесты на типы proposals и apply logic

## Success Criteria

1. Новые типы actions проходят через общий pipeline.
2. Mock adapter умеет генерировать больше одного типа предложений.
3. UI не разваливается на старом сценарии `create_tasks`.

## Verification

- unit tests по `lib/ai`
- smoke check для `/api/ai/runs`

## Output Format

В конце сессии вернуть:
- новые action types;
- измененные API routes;
- открытые ограничения.
