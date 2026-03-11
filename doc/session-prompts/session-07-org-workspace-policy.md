# Session 07: Organization, Workspace, Membership, Policy

## Mission

Сделать реальное платформенное ядро доступа вместо декоративного workspace selector:
- organization;
- workspace;
- membership;
- role;
- policy checks.

## Allowed Files

- `prisma/schema.prisma`
- `prisma/migrations/*`
- `lib/auth/*`
- `lib/policy/*`
- `app/api/middleware/*`
- `contexts/preferences-context.tsx`
- `lib/__tests__/policy*.test.ts`

## Forbidden Files

- `lib/import/*`
- `lib/briefs/*`
- `components/ai/*`

## Deliverables

1. Prisma models for org/workspace/membership
2. role and permission checks
3. policy helpers for API routes
4. workspace selector bound to actual rules, not just preferences

## Success Criteria

1. Workspace влияет на доступ и видимость.
2. Есть минимальные роли:
   - `EXEC`
   - `PM`
   - `OPS`
   - `FINANCE`
   - `MEMBER`
3. Можно использовать fake auth user, но policy must be real.

## Verification

- migration check
- policy tests
- smoke check selected routes

## Output Format

В конце сессии вернуть:
- итоговую access model;
- какие routes уже защищены;
- что ещё требует интеграции.
