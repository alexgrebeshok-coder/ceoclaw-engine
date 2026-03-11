import assert from "node:assert/strict";

import {
  applyAIProposal,
  getProposalItemCount,
  getProposalPreviewItems,
} from "@/lib/ai/action-engine";
import type { AIRunRecord } from "@/lib/ai/types";

function buildBaseRun(proposal: NonNullable<AIRunRecord["result"]>["proposal"]): AIRunRecord {
  return {
    id: "ai-run-test",
    agentId: "agent-test",
    title: "AI test run",
    prompt: "test",
    status: "needs_approval",
    createdAt: "2026-03-11T00:00:00.000Z",
    updatedAt: "2026-03-11T00:00:00.000Z",
    context: {
      type: "project",
      pathname: "/projects/test",
      title: "Test project",
      subtitle: "Project",
      projectId: "p1",
    },
    result: {
      title: "AI test run",
      summary: "Summary",
      highlights: ["h1"],
      nextSteps: ["n1"],
      proposal,
    },
  };
}

async function testApplyStatusReportProposal() {
  const run = buildBaseRun({
    id: "proposal-report",
    type: "draft_status_report",
    title: "Draft status",
    summary: "Prepare a status draft",
    state: "pending",
    tasks: [],
    statusReport: {
      projectId: "p1",
      title: "Weekly report",
      audience: "Leadership",
      channel: "weekly update",
      summary: "Project is stable",
      body: "Full report body",
      reason: "Keep leadership aligned",
    },
  });

  const applied = applyAIProposal(run, "proposal-report");

  assert.equal(applied.status, "done");
  assert.equal(applied.result?.proposal?.state, "applied");
  assert.equal(applied.result?.actionResult?.type, "draft_status_report");
  assert.equal(applied.result?.actionResult?.itemCount, 1);
  assert.equal(applied.result?.actionResult?.draftedStatusReport?.title, "Weekly report");
}

async function testPreviewItemsForRescheduleProposal() {
  const proposal = {
    id: "proposal-reschedule",
    type: "reschedule_tasks" as const,
    title: "Reschedule tasks",
    summary: "Shift dates",
    state: "pending" as const,
    tasks: [],
    taskReschedules: [
      {
        taskId: "t1",
        title: "Critical task",
        previousDueDate: "2026-03-10",
        newDueDate: "2026-03-13",
        assignee: "Sasha",
        reason: "Blocked by dependency",
      },
    ],
  };

  assert.equal(getProposalItemCount(proposal), 1);
  assert.equal(getProposalPreviewItems(proposal)[0].dueDate, "2026-03-13");
}

async function main() {
  await testApplyStatusReportProposal();
  await testPreviewItemsForRescheduleProposal();
  console.log("PASS ai-action-engine.unit");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
