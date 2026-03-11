# Session 08: Plan-vs-Fact and Financial Truth Layer

## Mission

Сделать первый реальный `plan-vs-fact` слой в CEOClaw:
- planned tasks / milestones / budget
- actual work reports / tasks / costs
- отклонения
- executive-grade signals

## Reuse Sources

- `/Users/aleksandrgrebeshok/CODEBASE/Проекты VScode/claude-workspace/projects/AI-PMO_Severavtodor_Project/02_Architecture/Integration_Design/EVM_VideoFact_Integration.md`
- `/Users/aleksandrgrebeshok/CODEBASE/Проекты VScode/claude-workspace/projects/AI-PMO_Severavtodor_Project/02_Architecture/Video_Fact_Module.md`

## Allowed Files

- `lib/plan-fact/*`
- `lib/plan-fact/**/*`
- `app/api/analytics/**/*`
- `app/api/briefs/**/*`
- `lib/__tests__/plan-fact*.test.ts`

## Forbidden Files

- `prisma/schema.prisma`
- `components/dashboard-provider.tsx`
- `lib/import/*`
- `contexts/preferences-context.tsx`

## Deliverables

1. plan-vs-fact comparison service
2. variance scoring
3. early warning rules
4. financial truth helpers for AC / EV / PV / CPI / SPI / EAC on available data
5. tests

## Success Criteria

1. Сервис умеет собрать variance summary по проекту.
2. Output пригоден для executive brief.
3. Формулы не требуют GPS/video facts, но умеют использовать их later.

## Verification

- unit tests
- API smoke tests

## Output Format

В конце сессии вернуть:
- какие variances считаются;
- какие assumptions пока временные;
- что нужно от connectors next.
