# Session 06: UI Shell for New Domains

## Mission

Подготовить UI shell для новых доменов CEOClaw без глубокого вмешательства в старые страницы:
- imports;
- executive briefs;
- work reports;
- connector health.

## Allowed Files

- `app/imports/**/*`
- `app/briefs/**/*`
- `app/work-reports/**/*`
- `app/integrations/**/*`
- `components/imports/*`
- `components/briefs/*`
- `components/work-reports/*`
- `components/integrations/*`
- `components/layout/*`

## Forbidden Files

- `prisma/schema.prisma`
- `lib/ai/*`
- `lib/import/*`
- `app/api/*`

## Deliverables

1. новые route pages
2. пустые state-safe pages с loading/error states
3. reusable cards/tables/forms для новых доменов
4. links from existing nav if safe

## Success Criteria

1. Новые разделы открываются без падений.
2. Можно подключить API later without rewrite.
3. Существующие страницы не ломаются.

## Verification

- build check
- ручной smoke UI

## Output Format

В конце сессии вернуть:
- список новых маршрутов;
- какие API endpoints ожидаются от backend-сессий.
