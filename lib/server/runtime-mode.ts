export type ServerDataMode = "auto" | "demo" | "live";
export type LiveOperatorDataBlockReason = "database_unavailable" | "demo_mode";
export interface ServerRuntimeState {
  dataMode: ServerDataMode;
  databaseConfigured: boolean;
  usingMockData: boolean;
  healthStatus: "degraded" | "ok";
}

type RuntimeEnv = NodeJS.ProcessEnv;

function normalizeMode(value: string | undefined): ServerDataMode {
  switch (value?.trim().toLowerCase()) {
    case "demo":
      return "demo";
    case "live":
      return "live";
    default:
      return "auto";
  }
}

export function getServerDataMode(env: RuntimeEnv = process.env): ServerDataMode {
  return normalizeMode(env.APP_DATA_MODE);
}

export function isDatabaseConfigured(env: RuntimeEnv = process.env): boolean {
  return Boolean(env.DATABASE_URL?.trim());
}

export function shouldServeMockData(env: RuntimeEnv = process.env): boolean {
  const mode = getServerDataMode(env);
  if (mode === "demo") return true;
  if (mode === "live") return false;
  return !isDatabaseConfigured(env);
}

export function getServerRuntimeState(env: RuntimeEnv = process.env): ServerRuntimeState {
  const dataMode = getServerDataMode(env);
  const databaseConfigured = isDatabaseConfigured(env);
  const usingMockData = shouldServeMockData(env);
  const healthStatus =
    dataMode === "live" && !databaseConfigured ? "degraded" : "ok";

  return {
    dataMode,
    databaseConfigured,
    usingMockData,
    healthStatus,
  };
}

export function getLiveOperatorDataBlockReason(
  runtime: ServerRuntimeState
): LiveOperatorDataBlockReason | null {
  if (runtime.usingMockData) {
    return runtime.dataMode === "demo" ? "demo_mode" : "database_unavailable";
  }

  if (!runtime.databaseConfigured) {
    return "database_unavailable";
  }

  return null;
}

export function canReadLiveOperatorData(runtime: ServerRuntimeState): boolean {
  return getLiveOperatorDataBlockReason(runtime) === null;
}
