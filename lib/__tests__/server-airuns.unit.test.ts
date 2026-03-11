import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import {
  applyServerAIProposal,
  createServerAIRun,
  getServerAIRun,
} from "@/lib/ai/server-runs";

import { createWorkReportSignalFixtureBundle } from "./fixtures/work-report-signal-fixtures";

const cacheDir = path.join(process.cwd(), ".ceoclaw-cache", "ai-runs");
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function cleanup(runId?: string) {
  if (!runId) return;
  await rm(path.join(cacheDir, `${runId}.json`), { force: true });
}

async function testMockApplyPersistsToSubsequentReads() {
  const previousMode = process.env.SEOCLAW_AI_MODE;
  process.env.SEOCLAW_AI_MODE = "mock";

  const { blueprints } = createWorkReportSignalFixtureBundle();
  const input = blueprints.find((blueprint) => blueprint.purpose === "tasks")?.input;

  assert.ok(input);

  await mkdir(cacheDir, { recursive: true });

  let runId: string | undefined;

  try {
    const run = await createServerAIRun(input);
    runId = run.id;
    let proposalId = run.result?.proposal?.id;

    for (let attempt = 0; !proposalId && attempt < 8; attempt += 1) {
      await sleep(300);
      const polled = await getServerAIRun(runId);
      proposalId = polled.result?.proposal?.id;
    }

    assert.ok(proposalId);

    await applyServerAIProposal({
      runId,
      proposalId,
    });

    const persisted = await getServerAIRun(runId);

    assert.equal(persisted.result?.proposal?.state, "applied");
    assert.equal(persisted.result?.actionResult?.safety.postApplyState, "guarded_execution");
    assert.equal(persisted.result?.actionResult?.safety.compensationMode, "follow_up_patch");
  } finally {
    await cleanup(runId);
    if (previousMode === undefined) {
      delete process.env.SEOCLAW_AI_MODE;
    } else {
      process.env.SEOCLAW_AI_MODE = previousMode;
    }
  }
}

async function main() {
  await testMockApplyPersistsToSubsequentReads();
  console.log("PASS server-airuns.unit");
}

void main();
