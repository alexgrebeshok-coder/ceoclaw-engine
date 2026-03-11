type GpsFetch = typeof fetch;

type GpsProbeMetadata = Record<string, string | number | boolean | null>;

export function getGpsApiUrl(env: NodeJS.ProcessEnv = process.env) {
  return env.GPS_API_URL?.trim() || null;
}

export function getGpsApiKey(env: NodeJS.ProcessEnv = process.env) {
  return env.GPS_API_KEY?.trim() || null;
}

export function buildGpsProbeUrl(baseUrl: string) {
  const url = new URL(baseUrl);
  const normalizedPath = url.pathname.replace(/\/$/, "");

  if (!url.search && !hasExplicitProbePath(normalizedPath)) {
    url.pathname = `${normalizedPath}/session-stats`;
  }

  return url.toString();
}

export async function probeGpsApi(
  input: {
    baseUrl: string;
    apiKey: string;
  },
  fetchImpl: GpsFetch = fetch
): Promise<
  | {
      ok: true;
      probeUrl: string;
      remoteStatus: "ok" | "degraded";
      message: string;
      metadata: GpsProbeMetadata;
    }
  | {
      ok: false;
      probeUrl: string;
      message: string;
      status?: number;
      metadata?: GpsProbeMetadata;
    }
> {
  const probeUrl = buildGpsProbeUrl(input.baseUrl);
  const response = await fetchImpl(probeUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${input.apiKey}`,
      "X-API-Key": input.apiKey,
    },
    cache: "no-store",
  });

  const text = await response.text();
  const parsedPayload = parseJson(text);

  if (!response.ok) {
    return {
      ok: false,
      probeUrl,
      status: response.status,
      message: `HTTP ${response.status} while calling GPS probe`,
      metadata: {
        probeUrl,
        responseShape: describePayloadShape(parsedPayload),
      },
    };
  }

  if (parsedPayload === undefined || parsedPayload === null) {
    return {
      ok: false,
      probeUrl,
      message:
        parsedPayload === null
          ? "GPS probe returned an empty payload."
          : "GPS probe returned a non-JSON payload.",
      metadata: {
        probeUrl,
        contentLength: text.length,
      },
    };
  }

  const interpretation = interpretGpsPayload(parsedPayload, probeUrl);

  return {
    ok: true,
    probeUrl,
    remoteStatus: interpretation.remoteStatus,
    message: interpretation.message,
    metadata: interpretation.metadata,
  };
}

function interpretGpsPayload(payload: unknown, probeUrl: string) {
  const metadata: GpsProbeMetadata = {
    probeUrl,
    responseShape: describePayloadShape(payload),
  };

  const statusValue = readStringField(payload, ["status", "health"]);
  const provider = readStringField(payload, ["provider", "source", "vendor", "platform"]);
  const equipmentCount = readNumberField(payload, [
    "total_equipment",
    "equipment_count",
    "totalEquipment",
  ]);
  const onlineEquipment = readNumberField(payload, [
    "online_equipment",
    "onlineEquipment",
  ]);
  const offlineEquipment = readNumberField(payload, [
    "offline_equipment",
    "offlineEquipment",
  ]);
  const activeAlerts = readNumberField(payload, ["active_alerts", "activeAlerts"]);
  const activeGeofences = readNumberField(payload, [
    "active_geofences",
    "activeGeofences",
  ]);
  const healthy = readBooleanField(payload, ["healthy", "ok"]);

  if (provider) metadata.provider = provider;
  if (statusValue) metadata.remoteStatus = statusValue;
  if (equipmentCount !== null) metadata.equipmentCount = equipmentCount;
  if (onlineEquipment !== null) metadata.onlineEquipment = onlineEquipment;
  if (offlineEquipment !== null) metadata.offlineEquipment = offlineEquipment;
  if (activeAlerts !== null) metadata.activeAlerts = activeAlerts;
  if (activeGeofences !== null) metadata.activeGeofences = activeGeofences;

  const remoteStatus: "ok" | "degraded" =
    healthy === false || isDegradedStatus(statusValue) ? "degraded" : "ok";

  const message =
    remoteStatus === "degraded"
      ? `GPS API responded from ${new URL(probeUrl).pathname}, but reported degraded health${statusValue ? `: ${statusValue}` : ""}.`
      : `GPS API responded from ${new URL(probeUrl).pathname}.`;

  return {
    remoteStatus,
    message,
    metadata,
  };
}

function hasExplicitProbePath(pathname: string) {
  return (
    pathname.endsWith("/session-stats") ||
    pathname.endsWith("/sessions") ||
    pathname.endsWith("/health") ||
    pathname.endsWith("/status")
  );
}

function isDegradedStatus(value: string | null) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized === "degraded" ||
    normalized === "error" ||
    normalized === "down" ||
    normalized === "offline" ||
    normalized === "unhealthy"
  );
}

function parseJson(value: string): unknown {
  if (!value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function describePayloadShape(payload: unknown) {
  if (Array.isArray(payload)) {
    return "array";
  }

  if (payload && typeof payload === "object") {
    return "object";
  }

  if (payload === null) {
    return "null";
  }

  return typeof payload;
}

function readStringField(payload: unknown, keys: string[]) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  for (const key of keys) {
    const value = (payload as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function readNumberField(payload: unknown, keys: string[]) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  for (const key of keys) {
    const value = (payload as Record<string, unknown>)[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function readBooleanField(payload: unknown, keys: string[]) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  for (const key of keys) {
    const value = (payload as Record<string, unknown>)[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
}
