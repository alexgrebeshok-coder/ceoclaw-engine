import assert from "node:assert/strict";

import { applyAIProposal, getProposalItemCount, hasPendingProposal } from "../ai/action-engine";
import { buildMockFinalRun } from "../ai/mock-adapter";
import type { AIRunInput, AIQuickActionKind } from "../ai/types";
import type { NotificationItem, Project, Risk, Task, TeamMember } from "../types";

const project: Project = {
  id: "project-alpha",
  name: "Project Alpha",
  description: "High-priority industrial rollout.",
  status: "at-risk",
  progress: 58,
  direction: "metallurgy",
  budget: { planned: 1200000, actual: 980000, currency: "RUB" },
  dates: { start: "2026-03-01", end: "2026-04-15" },
  nextMilestone: { name: "Site readiness", date: "2026-03-20" },
  team: ["Alex PM", "Nina Ops", "Chen QA"],
  risks: 2,
  location: "Chelyabinsk",
  priority: "critical",
  health: 63,
  objectives: ["Unblock delivery", "Stabilize schedule"],
  materials: 72,
  laborProductivity: 81,
  safety: { ltifr: 0.1, trir: 0.2 },
  history: [],
};

const tasks: Task[] = [
  {
    id: "task-1",
    projectId: project.id,
    title: "Resolve crane permit",
    description: "Permit review is blocking the next install window.",
    status: "blocked",
    order: 1,
    assignee: { id: "u1", name: "Alex PM" },
    dueDate: "2026-03-08",
    priority: "high",
    tags: ["permits"],
    createdAt: "2026-03-01T09:00:00.000Z",
    blockedReason: "Waiting for city approval.",
  },
  {
    id: "task-2",
    projectId: project.id,
    title: "Rebaseline electrical work",
    description: "Need a fresh due date after supplier slip.",
    status: "in-progress",
    order: 2,
    assignee: { id: "u2", name: "Nina Ops" },
    dueDate: "2026-03-09",
    priority: "medium",
    tags: ["schedule"],
    createdAt: "2026-03-02T09:00:00.000Z",
  },
];

const team: TeamMember[] = [
  {
    id: "u1",
    name: "Alex PM",
    role: "PM",
    email: "alex@example.com",
    capacity: 100,
    allocated: 80,
    projects: [project.id],
    location: "Chelyabinsk",
  },
  {
    id: "u2",
    name: "Nina Ops",
    role: "Operations",
    email: "nina@example.com",
    capacity: 100,
    allocated: 72,
    projects: [project.id],
    location: "Chelyabinsk",
  },
];

const risks: Risk[] = [
  {
    id: "risk-1",
    projectId: project.id,
    title: "Permit delay risk",
    owner: "Alex PM",
    probability: 75,
    impact: 82,
    status: "open",
    mitigation: "Escalate permit review with the city office.",
    category: "schedule",
  },
];

const notifications: NotificationItem[] = [
  {
    id: "notification-1",
    title: "Blocked task",
    description: "Permit review is now blocking field work.",
    severity: "warning",
    createdAt: "2026-03-10T09:00:00.000Z",
    projectId: project.id,
  },
];

function buildInput(kind: AIQuickActionKind, prompt: string): AIRunInput {
  return {
    agent: {
      id: "execution-planner",
      kind: "planner",
      nameKey: "agent.planner",
      descriptionKey: "agent.plannerDescription",
      accentClass: "bg-slate-100",
      icon: "sparkles",
      category: "planning",
    },
    prompt,
    quickAction: {
      id: `qa-${kind}`,
      kind,
      agentId: "execution-planner",
      labelKey: "ai.quick.tasks",
      descriptionKey: "ai.quick.tasksDescription",
      promptKey: "ai.quick.tasksPrompt",
      contextTypes: ["project"],
    },
    context: {
      locale: "en",
      interfaceLocale: "en",
      generatedAt: "2026-03-11T08:00:00.000Z",
      activeContext: {
        type: "project",
        pathname: `/projects/${project.id}`,
        title: project.name,
        subtitle: "Project workspace",
        projectId: project.id,
      },
      projects: [project],
      tasks,
      team,
      risks,
      notifications,
      project,
      projectTasks: tasks,
    },
  };
}

async function run() {
  const createRun = buildMockFinalRun(buildInput("suggest_tasks", "Create a recovery task plan"));
  const createProposal = createRun.result?.proposal;
  if (!createProposal || createProposal.type !== "create_tasks") {
    throw new Error("Expected create_tasks proposal for suggest_tasks.");
  }
  assert.equal(createRun.status, "needs_approval");
  assert.equal(hasPendingProposal(createRun.result), true);
  assert.equal(getProposalItemCount(createProposal), 3);

  const rescheduleRun = buildMockFinalRun(buildInput("triage_tasks", "Replan the overdue tasks"));
  const rescheduleProposal = rescheduleRun.result?.proposal;
  if (!rescheduleProposal || rescheduleProposal.type !== "reschedule_tasks") {
    throw new Error("Expected reschedule_tasks proposal for triage_tasks.");
  }
  assert.ok(getProposalItemCount(rescheduleProposal) >= 1);

  const riskRun = buildMockFinalRun(buildInput("analyze_project", "Review the project risks"));
  const riskProposal = riskRun.result?.proposal;
  if (!riskProposal || riskProposal.type !== "raise_risks") {
    throw new Error("Expected raise_risks proposal for analyze_project.");
  }

  const reportRun = buildMockFinalRun(
    buildInput("draft_status_report", "Prepare the weekly status update")
  );
  const reportProposal = reportRun.result?.proposal;
  if (!reportProposal || reportProposal.type !== "draft_status_report") {
    throw new Error("Expected draft_status_report proposal for report action.");
  }

  const notifyRun = buildMockFinalRun(
    buildInput("draft_status_report", "Notify the team about blocker status")
  );
  const notifyProposal = notifyRun.result?.proposal;
  if (!notifyProposal || notifyProposal.type !== "notify_team") {
    throw new Error("Expected notify_team proposal for notify prompt.");
  }

  const appliedCreateRun = applyAIProposal(createRun, createProposal.id);
  assert.equal(appliedCreateRun.status, "done");
  assert.equal(appliedCreateRun.result?.proposal?.state, "applied");
  assert.equal(appliedCreateRun.result?.actionResult?.type, "create_tasks");
  assert.equal(
    appliedCreateRun.result?.actionResult?.tasksCreated.length,
    createProposal.tasks.length
  );

  const appliedRiskRun = applyAIProposal(riskRun, riskProposal.id);
  assert.equal(appliedRiskRun.result?.actionResult?.type, "raise_risks");
  assert.equal(
    appliedRiskRun.result?.actionResult?.risksRaised.length,
    riskProposal.risks.length
  );

  const appliedReportRun = applyAIProposal(reportRun, reportProposal.id);
  assert.equal(appliedReportRun.result?.actionResult?.type, "draft_status_report");
  assert.ok(appliedReportRun.result?.actionResult?.draftedStatusReport?.title.length);

  console.log("PASS ai-action-engine");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
