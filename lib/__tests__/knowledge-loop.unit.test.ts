import assert from "node:assert/strict";

import { getKnowledgeLoopOverview } from "@/lib/knowledge";
import type { EscalationListResult, EscalationRecordView } from "@/lib/escalations";

function createEscalation(input: {
  id: string;
  title: string;
  queueStatus: EscalationRecordView["queueStatus"];
  urgency: EscalationRecordView["urgency"];
  proposalType?: string;
  purpose?: string;
  ownerRole?: string | null;
  ownerName?: string | null;
  acknowledgedAt?: string | null;
  slaState?: EscalationRecordView["slaState"];
  projectName?: string | null;
}) {
  return {
    id: input.id,
    sourceType: "ai_run:work_report_signal_packet",
    sourceRef: "packet-1",
    entityType: "ai_run",
    entityRef: input.id,
    projectId: "project-1",
    projectName: input.projectName ?? "Yamal Package",
    title: input.title,
    summary: "Repeated operating pattern from the signal queue.",
    purpose: input.purpose ?? "tasks",
    urgency: input.urgency,
    queueStatus: input.queueStatus,
    sourceStatus: input.queueStatus === "resolved" ? "resolved" : "needs_approval",
    owner:
      input.ownerName || input.ownerRole
        ? {
            id: `owner-${input.id}`,
            name: input.ownerName ?? "Operator",
            role: input.ownerRole ?? null,
          }
        : null,
    recommendedOwnerRole: input.ownerRole ?? "Руководитель проектов",
    firstObservedAt: "2026-03-11T08:00:00.000Z",
    lastObservedAt: "2026-03-11T09:00:00.000Z",
    acknowledgedAt: input.acknowledgedAt ?? null,
    resolvedAt:
      input.queueStatus === "resolved" ? "2026-03-11T16:00:00.000Z" : null,
    slaTargetAt: "2026-03-11T20:00:00.000Z",
    slaState: input.slaState ?? "on_track",
    ageHours: 4,
    metadata: {
      proposalType: input.proposalType,
      purposeLabel: input.purpose ?? "tasks",
      runId: `run-${input.id}`,
    },
  } satisfies EscalationRecordView;
}

async function testKnowledgeLoopBuildsRepeatedPlaybooksAndGuidance() {
  const queue: EscalationListResult = {
    syncedAt: "2026-03-11T18:00:00.000Z",
    summary: {
      total: 3,
      open: 1,
      acknowledged: 1,
      resolved: 1,
      critical: 1,
      high: 1,
      dueSoon: 0,
      breached: 1,
      unassigned: 1,
    },
    items: [
      createEscalation({
        id: "esc-1",
        title: "Permit follow-up drift",
        queueStatus: "open",
        urgency: "critical",
        proposalType: "update_tasks",
        ownerRole: "Руководитель проектов",
        acknowledgedAt: "2026-03-11T10:00:00.000Z",
      }),
      createEscalation({
        id: "esc-2",
        title: "Shift handoff patch",
        queueStatus: "resolved",
        urgency: "high",
        proposalType: "update_tasks",
        ownerRole: "Руководитель проектов",
        acknowledgedAt: "2026-03-11T11:00:00.000Z",
      }),
      createEscalation({
        id: "esc-3",
        title: "Executive narrative refresh",
        queueStatus: "acknowledged",
        urgency: "low",
        proposalType: "draft_status_report",
        purpose: "status",
        ownerRole: "Project Controls",
        acknowledgedAt: null,
        slaState: "breached",
      }),
    ],
    sync: null,
  };

  const overview = await getKnowledgeLoopOverview(
    { limit: 4 },
    {
      escalations: queue,
      now: () => new Date("2026-03-11T18:00:00.000Z"),
    }
  );

  assert.equal(overview.summary.totalPlaybooks, 2);
  assert.equal(overview.summary.repeatedPlaybooks, 1);
  assert.equal(overview.summary.benchmarkedGuidance, 2);
  assert.equal(overview.playbooks[0]?.proposalType, "update_tasks");
  assert.equal(overview.playbooks[0]?.maturity, "repeated");
  assert.equal(overview.playbooks[0]?.benchmark.ownerRole, "Руководитель проектов");
  assert.equal(overview.playbooks[0]?.benchmark.ackTargetHours, 2.5);
  assert.equal(overview.playbooks[0]?.benchmark.resolutionRate, 0.5);
  assert.equal(overview.playbooks[0]?.compensationMode, "follow_up_patch");
  assert.match(overview.playbooks[0]?.guidance ?? "", /2.5h/);

  const activeGuidance = overview.activeGuidance.find(
    (item) => item.escalationId === "esc-1"
  );
  assert.equal(activeGuidance?.playbookTitle, "Execution patch playbook");
  assert.match(activeGuidance?.recommendedAction ?? "", /Assign/u);
  assert.match(activeGuidance?.benchmarkSummary ?? "", /resolution rate 50%/i);
}

async function testKnowledgeLoopFallsBackToSlaWindowWhenNoAckHistoryExists() {
  const queue: EscalationListResult = {
    syncedAt: "2026-03-11T20:00:00.000Z",
    summary: {
      total: 1,
      open: 1,
      acknowledged: 0,
      resolved: 0,
      critical: 0,
      high: 1,
      dueSoon: 1,
      breached: 0,
      unassigned: 1,
    },
    items: [
      createEscalation({
        id: "esc-4",
        title: "Risk surfacing backlog",
        queueStatus: "open",
        urgency: "high",
        proposalType: "raise_risks",
        purpose: "risks",
        ownerRole: null,
        acknowledgedAt: null,
        slaState: "due_soon",
      }),
    ],
    sync: null,
  };

  const overview = await getKnowledgeLoopOverview({ limit: 4 }, { escalations: queue });
  assert.equal(overview.playbooks.length, 1);
  assert.equal(overview.playbooks[0]?.benchmark.source, "sla_window");
  assert.equal(overview.playbooks[0]?.benchmark.ackTargetHours, 6);
  assert.match(
    overview.playbooks[0]?.lessons.join(" ") ?? "",
    /First move is explicit owner assignment/i
  );
}

async function main() {
  await testKnowledgeLoopBuildsRepeatedPlaybooksAndGuidance();
  await testKnowledgeLoopFallsBackToSlaWindowWhenNoAckHistoryExists();
  console.log("PASS knowledge-loop.unit");
}

void main();
