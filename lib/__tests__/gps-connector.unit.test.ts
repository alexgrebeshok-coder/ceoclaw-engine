import assert from "node:assert/strict";

import { createGpsConnector } from "@/lib/connectors";

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function testMissingSecretsStayPending() {
  const connector = createGpsConnector({} as NodeJS.ProcessEnv);
  const status = await connector.getStatus();

  assert.equal(status.stub, false);
  assert.equal(status.configured, false);
  assert.equal(status.status, "pending");
  assert.deepEqual(status.missingSecrets, ["GPS_API_URL", "GPS_API_KEY"]);
}

async function testHealthyProbeReturnsOk() {
  let observedUrl = "";

  const connector = createGpsConnector(
    {
      GPS_API_URL: "https://gps.example.com/api/v1",
      GPS_API_KEY: "gps-api-key",
    } as NodeJS.ProcessEnv,
    (async (input: string | URL | Request) => {
      observedUrl = String(input);
      return createJsonResponse({
        status: "ok",
        provider: "Teltonika Gateway",
        total_equipment: 68,
        online_equipment: 61,
        offline_equipment: 7,
        active_alerts: 2,
      });
    }) as typeof fetch
  );

  const status = await connector.getStatus();

  assert.equal(observedUrl, "https://gps.example.com/api/v1/session-stats");
  assert.equal(status.status, "ok");
  assert.equal(status.configured, true);
  assert.equal(status.metadata?.provider, "Teltonika Gateway");
  assert.equal(status.metadata?.equipmentCount, 68);
  assert.equal(status.metadata?.onlineEquipment, 61);
}

async function testRemoteDegradedStatusSurfacesHonestly() {
  const connector = createGpsConnector(
    {
      GPS_API_URL: "https://gps.example.com/api/v1/session-stats",
      GPS_API_KEY: "gps-api-key",
    } as NodeJS.ProcessEnv,
    (async () =>
      createJsonResponse({
        status: "degraded",
        total_equipment: 68,
      })) as typeof fetch
  );

  const status = await connector.getStatus();

  assert.equal(status.status, "degraded");
  assert.match(status.message, /reported degraded health/i);
  assert.equal(status.metadata?.remoteStatus, "degraded");
}

async function testHttpFailureReturnsDegraded() {
  const connector = createGpsConnector(
    {
      GPS_API_URL: "https://gps.example.com/api/v1",
      GPS_API_KEY: "gps-api-key",
    } as NodeJS.ProcessEnv,
    (async () => createJsonResponse({ error: "unauthorized" }, 401)) as typeof fetch
  );

  const status = await connector.getStatus();

  assert.equal(status.status, "degraded");
  assert.match(status.message, /HTTP 401/i);
}

async function main() {
  await testMissingSecretsStayPending();
  await testHealthyProbeReturnsOk();
  await testRemoteDegradedStatusSurfacesHonestly();
  await testHttpFailureReturnsDegraded();
  console.log("PASS gps-connector.unit");
}

void main();
