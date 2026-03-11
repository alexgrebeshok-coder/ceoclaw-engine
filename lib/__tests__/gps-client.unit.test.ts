import assert from "node:assert/strict";

import {
  buildGpsSampleUrl,
  fetchGpsTelemetrySample,
  getGpsTelemetrySampleSnapshot,
} from "@/lib/connectors/gps-client";

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function testBuildGpsSampleUrlUsesSessionsPath() {
  assert.equal(
    buildGpsSampleUrl("https://gps.example.com/api/v1"),
    "https://gps.example.com/api/v1/sessions?page_size=3"
  );
  assert.equal(
    buildGpsSampleUrl("https://gps.example.com/api/v1/session-stats"),
    "https://gps.example.com/api/v1/sessions?page_size=3"
  );
}

async function testTelemetrySampleNormalization() {
  let observedUrl = "";

  const result = await fetchGpsTelemetrySample(
    {
      baseUrl: "https://gps.example.com/api/v1",
      apiKey: "gps-api-key",
    },
    (async (input: string | URL | Request) => {
      observedUrl = String(input);
      return createJsonResponse({
        equipment_id: "EXC-KOM-01",
        sessions: [
          {
            session_id: "sess-20260207-EXC-KOM-01-003",
            session_type: "work",
            started_at: "2026-02-07T08:00:00Z",
            ended_at: "2026-02-07T10:30:00Z",
            duration_seconds: 9000,
            geofence_id: "GF-SITE-YANAO-SL01",
            geofence_name: "Salekhard-Labytnangi Earthwork Zone",
          },
        ],
      });
    }) as typeof fetch
  );

  assert.equal(observedUrl, "https://gps.example.com/api/v1/sessions?page_size=3");
  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected telemetry sample to parse successfully.");
  }

  assert.equal(result.samples.length, 1);
  assert.deepEqual(result.samples[0], {
    source: "gps",
    sessionId: "sess-20260207-EXC-KOM-01-003",
    equipmentId: "EXC-KOM-01",
    equipmentType: null,
    status: "work",
    startedAt: "2026-02-07T08:00:00Z",
    endedAt: "2026-02-07T10:30:00Z",
    durationSeconds: 9000,
    geofenceId: "GF-SITE-YANAO-SL01",
    geofenceName: "Salekhard-Labytnangi Earthwork Zone",
  });
}

async function testEmptyTelemetryPayloadReturnsFailure() {
  const result = await fetchGpsTelemetrySample(
    {
      baseUrl: "https://gps.example.com/api/v1",
      apiKey: "gps-api-key",
    },
    (async () => createJsonResponse({ sessions: [] })) as typeof fetch
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected telemetry sample to fail on empty sessions.");
  }

  assert.match(result.message, /no session-like records/i);
}

async function testSnapshotStaysPendingWithoutSecrets() {
  const snapshot = await getGpsTelemetrySampleSnapshot({} as NodeJS.ProcessEnv);

  assert.equal(snapshot.status, "pending");
  assert.equal(snapshot.configured, false);
  assert.deepEqual(snapshot.missingSecrets, ["GPS_API_URL", "GPS_API_KEY"]);
  assert.equal(snapshot.samples.length, 0);
}

async function main() {
  await testBuildGpsSampleUrlUsesSessionsPath();
  await testTelemetrySampleNormalization();
  await testEmptyTelemetryPayloadReturnsFailure();
  await testSnapshotStaysPendingWithoutSecrets();
  console.log("PASS gps-client.unit");
}

void main();
