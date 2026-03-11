# Session 14: Second Live Datasource Connector Upgrade

## Goal

Upgrade a second datasource connector from a pure stub into an honest live readiness probe.

This session must produce a working end-to-end flow:

`connector registry -> live datasource probe -> API status -> integrations UI`

## Scope

Work only in the second datasource connector slice:

- `lib/connectors/**`
- `app/api/connectors/**`
- `app/api/health/route.ts`
- `components/integrations/**`
- connector-focused unit tests only

## Product intent

After the first live connector, the platform should prove that the connector framework can support more than one honest integration path.

This session should:

1. pick one datasource connector that is already represented in the registry;
2. replace the stub with a real readiness probe;
3. keep the platform explicit about `stub` vs `live`;
4. avoid pretending full ingestion exists when it does not.

## Requirements

1. Pick one existing datasource connector such as GPS/GLONASS.
2. Keep the connector inside the shared registry and route surface.
3. Add a real probe that returns:
   - `configured` vs missing credentials;
   - `ok / pending / degraded`;
   - human-readable health message;
   - small provider metadata where available.
4. Update `/integrations` so operators can see that the connector is now `Live probe`.
5. Add focused unit and route coverage for the upgraded connector.

## Constraints

1. Do not introduce a sync engine or background job in this session.
2. Do not broaden the connector abstraction beyond the current framework.
3. Do not claim read/write semantics that do not exist yet.
4. Prefer one honest readiness probe over a broad but fake datasource API.

## Verification

Minimum verification:

1. `npm run test:unit`
2. `npm run build`
3. Runtime smoke:
   - `GET /api/connectors`
   - `GET /api/connectors/:id`
   - `GET /api/health`
   - `GET /integrations`

## Done when

This session is done when the second datasource connector is clearly no longer a stub and the operator can see its real live readiness state through API and UI.
