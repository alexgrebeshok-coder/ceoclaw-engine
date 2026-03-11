export type ServerDataMode = "auto" | "demo" | "live";

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

export function getServerRuntimeState(env: RuntimeEnv = process.env) {
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
