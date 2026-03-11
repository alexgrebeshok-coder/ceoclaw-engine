# Session 04: Work Reports Domain Port from AI-PMO

## Mission

Перенести в CEOClaw домен `work reports` на основе AI-PMO Telegram journal bot:
- отчет с участка;
- submit / review / approve;
- reporter role;
- project-scoped retrieval.

## Reuse Sources

- `/Users/aleksandrgrebeshok/CODEBASE/Проекты VScode/claude-workspace/projects/AI-PMO_Severavtodor_Project/03_Agents_Development/telegram_journal_bot/models.py`
- `/Users/aleksandrgrebeshok/CODEBASE/Проекты VScode/claude-workspace/projects/AI-PMO_Severavtodor_Project/03_Agents_Development/telegram_journal_bot/db.py`
- `/Users/aleksandrgrebeshok/CODEBASE/Проекты VScode/claude-workspace/projects/AI-PMO_Severavtodor_Project/03_Agents_Development/telegram_journal_bot/README.md`

## Allowed Files

- `prisma/schema.prisma`
- `prisma/migrations/*`
- `lib/work-reports/*`
- `lib/work-reports/**/*`
- `app/api/work-reports/**/*`
- `lib/validators/*`
- `lib/__tests__/work-reports*.test.ts`

## Forbidden Files

- `components/dashboard-provider.tsx`
- `lib/ai/*`
- `lib/import/*`

## Deliverables

1. Prisma model for work reports
2. API CRUD + approve/reject
3. validators
4. mapper from AI-PMO bot shape to CEOClaw shape
5. tests

## Success Criteria

1. Есть статусная модель:
   - `submitted`
   - `approved`
   - `rejected`
2. Отчет привязывается к проекту и автору.
3. Attachments пока можно хранить как metadata array.
4. Нет UI-правок в этой сессии.

## Verification

- migration check
- unit tests
- smoke test API routes

## Output Format

В конце сессии вернуть:
- итоговую Prisma модель;
- routes;
- что нужно UI-сессии.
