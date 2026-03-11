import assert from "node:assert/strict";

import {
  getServerDataMode,
  getServerRuntimeState,
  isDatabaseConfigured,
  shouldServeMockData,
} from "../server/runtime-mode";

assert.equal(getServerDataMode({} as NodeJS.ProcessEnv), "auto");
assert.equal(
  getServerDataMode({ APP_DATA_MODE: "demo" } as NodeJS.ProcessEnv),
  "demo"
);
assert.equal(
  getServerDataMode({ APP_DATA_MODE: "live" } as NodeJS.ProcessEnv),
  "live"
);

assert.equal(isDatabaseConfigured({ DATABASE_URL: "" } as NodeJS.ProcessEnv), false);
assert.equal(
  isDatabaseConfigured({ DATABASE_URL: "file:./dev.db" } as NodeJS.ProcessEnv),
  true
);

assert.equal(shouldServeMockData({} as NodeJS.ProcessEnv), true);
assert.equal(
  shouldServeMockData({
    APP_DATA_MODE: "demo",
    DATABASE_URL: "file:./dev.db",
  } as NodeJS.ProcessEnv),
  true
);
assert.equal(
  shouldServeMockData({
    APP_DATA_MODE: "live",
    DATABASE_URL: "file:./dev.db",
  } as NodeJS.ProcessEnv),
  false
);

const degradedRuntime = getServerRuntimeState({
  APP_DATA_MODE: "live",
} as NodeJS.ProcessEnv);
assert.equal(degradedRuntime.healthStatus, "degraded");
assert.equal(degradedRuntime.databaseConfigured, false);
assert.equal(degradedRuntime.usingMockData, false);

const demoRuntime = getServerRuntimeState({
  APP_DATA_MODE: "demo",
  DATABASE_URL: "file:./dev.db",
} as NodeJS.ProcessEnv);
assert.equal(demoRuntime.healthStatus, "ok");
assert.equal(demoRuntime.usingMockData, true);

console.log("PASS runtime-mode.unit");
