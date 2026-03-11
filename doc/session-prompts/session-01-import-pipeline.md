# Session 01: Import and Validation Pipeline

## Mission

Перенести в CEOClaw MVP ingestion layer по мотивам AI-PMO real-data testing:
- импорт Excel/CSV/TSV;
- автоопределение формата;
- валидация project input files;
- нормализованный import result.

## Reuse Sources

- `/Users/aleksandrgrebeshok/Desktop/AI_PMO_Real_Data_Testing/scripts/data_loader.py`
- `/Users/aleksandrgrebeshok/Desktop/AI_PMO_Real_Data_Testing/scripts/validate_data.py`
- `/Users/aleksandrgrebeshok/Desktop/AI_PMO_Real_Data_Testing/scripts/README.md`

## Allowed Files

- `lib/import/*`
- `lib/import/**/*`
- `lib/__tests__/import*.test.ts`
- `app/api/import/*`
- `app/api/import/**/*`
- `doc/api.md`

## Forbidden Files

- `prisma/schema.prisma`
- `components/dashboard-provider.tsx`
- `lib/ai/*`
- `components/*`

## Deliverables

1. `lib/import/file-reader.ts`
2. `lib/import/validators.ts`
3. `lib/import/types.ts`
4. `lib/import/project-import-service.ts`
5. `app/api/import/validate/route.ts`
6. `app/api/import/preview/route.ts`
7. unit tests для чтения и валидации

## Functional Scope

Нужно поддержать:
- WBS
- Budget Plan
- Risk Register
- Payment History
- Worklog Summary
- Main Contract metadata placeholder

## Success Criteria

1. Можно передать набор файлов и получить:
   - список распознанных файлов;
   - ошибки;
   - warnings;
   - preview normalized data.
2. Нет изменений в Prisma и UI.
3. Компоненты не завязаны на browser-only API.

## Verification

- `npm run test:unit`
- если не проходит весь набор, минимум запустить новые тесты через `tsx`

## Output Format

В конце сессии вернуть:
- что сделано;
- какие файлы изменены;
- что не закрыто.
