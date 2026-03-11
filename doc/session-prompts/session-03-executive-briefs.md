# Session 03: Executive Brief and Alert Engine

## Mission

Сделать в CEOClaw движок executive brief и alerts на текущих данных:
- portfolio brief;
- project brief;
- alert prioritization;
- recommendations summary.

## Reuse Sources

- `/Users/aleksandrgrebeshok/Desktop/КСУП_AI-PMO_Северавтодор/08_AI_Документация/AI-01_Концепция_системы_AI-PMO.md`
- `/Users/aleksandrgrebeshok/CODEBASE/Проекты VScode/claude-workspace/projects/AI-PMO_Severavtodor_Project/02_Architecture/System_Architecture.md`
- текущие analytics и insights в CEOClaw

## Allowed Files

- `lib/briefs/*`
- `lib/briefs/**/*`
- `lib/alerts/*`
- `lib/alerts/**/*`
- `app/api/briefs/**/*`
- `app/api/alerts/**/*`
- `lib/__tests__/brief*.test.ts`
- `lib/__tests__/alert*.test.ts`

## Forbidden Files

- `prisma/schema.prisma`
- `components/dashboard-provider.tsx`
- `lib/import/*`
- `lib/ai/*`

## Deliverables

1. `portfolio brief generator`
2. `project brief generator`
3. `alert scoring` по severity + confidence + freshness
4. API routes для brief preview
5. unit tests

## Success Criteria

1. Можно запросить brief без внешнего AI.
2. Output пригоден для dashboard card, Telegram digest и email digest.
3. В brief всегда есть:
   - what happened;
   - why it matters;
   - recommended actions.

## Verification

- новые unit tests
- ручная проверка JSON output API

## Output Format

В конце сессии вернуть:
- пример portfolio brief;
- пример project brief;
- список файлов.
