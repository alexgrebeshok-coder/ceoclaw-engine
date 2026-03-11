import assert from "node:assert/strict";

import {
  buildPortfolioPlanFactSummary,
  buildProjectPlanFactSummary,
} from "@/lib/plan-fact/service";
import type { ExecutiveSnapshot } from "@/lib/briefs/types";

const referenceDate = "2026-03-06T00:00:00.000Z";

const snapshot: ExecutiveSnapshot = {
  generatedAt: referenceDate,
  projects: [
    {
      id: "project-alpha",
      name: "Project Alpha",
      status: "active",
      priority: "high",
      progress: 30,
      health: 52,
      budget: {
        planned: 1000,
        actual: 700,
        currency: "RUB",
      },
      dates: {
        start: "2026-03-01T00:00:00.000Z",
        end: "2026-03-11T00:00:00.000Z",
      },
      nextMilestone: {
        name: "Milestone A",
        date: "2026-03-08T00:00:00.000Z",
      },
      history: [],
    },
    {
      id: "project-beta",
      name: "Project Beta",
      status: "active",
      priority: "medium",
      progress: 65,
      health: 74,
      budget: {
        planned: 2000,
        actual: 950,
        currency: "RUB",
      },
      dates: {
        start: "2026-03-01T00:00:00.000Z",
        end: "2026-03-15T00:00:00.000Z",
      },
      nextMilestone: null,
      history: [],
    },
  ],
  tasks: [
    {
      id: "task-1",
      projectId: "project-alpha",
      title: "Alpha done",
      status: "done",
      priority: "high",
      dueDate: "2026-03-03T00:00:00.000Z",
      createdAt: "2026-03-01T00:00:00.000Z",
      completedAt: "2026-03-03T00:00:00.000Z",
    },
    {
      id: "task-2",
      projectId: "project-alpha",
      title: "Alpha overdue",
      status: "todo",
      priority: "critical",
      dueDate: "2026-03-04T00:00:00.000Z",
      createdAt: "2026-03-01T00:00:00.000Z",
    },
    {
      id: "task-3",
      projectId: "project-alpha",
      title: "Alpha blocked",
      status: "blocked",
      priority: "medium",
      dueDate: "2026-03-07T00:00:00.000Z",
      createdAt: "2026-03-01T00:00:00.000Z",
    },
    {
      id: "task-4",
      projectId: "project-alpha",
      title: "Alpha todo",
      status: "todo",
      priority: "low",
      dueDate: "2026-03-09T00:00:00.000Z",
      createdAt: "2026-03-01T00:00:00.000Z",
    },
    {
      id: "task-5",
      projectId: "project-beta",
      title: "Beta done",
      status: "done",
      priority: "medium",
      dueDate: "2026-03-04T00:00:00.000Z",
      createdAt: "2026-03-01T00:00:00.000Z",
      completedAt: "2026-03-04T00:00:00.000Z",
    },
    {
      id: "task-6",
      projectId: "project-beta",
      title: "Beta done 2",
      status: "done",
      priority: "medium",
      dueDate: "2026-03-05T00:00:00.000Z",
      createdAt: "2026-03-01T00:00:00.000Z",
      completedAt: "2026-03-05T00:00:00.000Z",
    },
    {
      id: "task-7",
      projectId: "project-beta",
      title: "Beta todo",
      status: "todo",
      priority: "low",
      dueDate: "2026-03-12T00:00:00.000Z",
      createdAt: "2026-03-01T00:00:00.000Z",
    },
  ],
  risks: [],
  milestones: [
    {
      id: "milestone-alpha",
      projectId: "project-alpha",
      title: "Milestone A",
      date: "2026-03-05T00:00:00.000Z",
      status: "upcoming",
      updatedAt: "2026-03-01T00:00:00.000Z",
    },
    {
      id: "milestone-beta",
      projectId: "project-beta",
      title: "Milestone B",
      date: "2026-03-10T00:00:00.000Z",
      status: "completed",
      updatedAt: "2026-03-05T00:00:00.000Z",
    },
  ],
  workReports: [
    {
      id: "report-1",
      projectId: "project-alpha",
      reportNumber: "#A-001",
      reportDate: "2026-03-01T00:00:00.000Z",
      status: "approved",
      source: "manual",
      authorId: "member-1",
      reviewerId: "reviewer-1",
      submittedAt: "2026-03-01T00:00:00.000Z",
      reviewedAt: "2026-03-01T00:00:00.000Z",
    },
    {
      id: "report-2",
      projectId: "project-alpha",
      reportNumber: "#A-002",
      reportDate: "2026-03-04T00:00:00.000Z",
      status: "submitted",
      source: "manual",
      authorId: "member-1",
      reviewerId: null,
      submittedAt: "2026-03-04T00:00:00.000Z",
      reviewedAt: null,
    },
    {
      id: "report-3",
      projectId: "project-alpha",
      reportNumber: "#A-003",
      reportDate: "2026-03-05T00:00:00.000Z",
      status: "submitted",
      source: "manual",
      authorId: "member-2",
      reviewerId: null,
      submittedAt: "2026-03-05T00:00:00.000Z",
      reviewedAt: null,
    },
    {
      id: "report-4",
      projectId: "project-beta",
      reportNumber: "#B-001",
      reportDate: "2026-03-05T00:00:00.000Z",
      status: "approved",
      source: "manual",
      authorId: "member-3",
      reviewerId: "reviewer-1",
      submittedAt: "2026-03-05T00:00:00.000Z",
      reviewedAt: "2026-03-05T00:00:00.000Z",
    },
  ],
  teamMembers: [],
};

function testProjectPlanFactSummary() {
  const summary = buildProjectPlanFactSummary(snapshot, "project-alpha", {
    referenceDate,
  });

  assert.equal(summary.projectId, "project-alpha");
  assert.equal(summary.status, "critical");
  assert.equal(summary.plannedProgress, 50);
  assert.ok(summary.actualProgress < summary.plannedProgress);
  assert.equal(summary.evidence.overdueTasks, 1);
  assert.equal(summary.evidence.pendingWorkReports, 2);
  assert.ok(summary.evm.cpi !== null && summary.evm.cpi < 1);
  assert.ok(summary.evm.spi !== null && summary.evm.spi < 1);
  assert.ok(summary.warnings.some((warning) => warning.code === "SCHEDULE_DRIFT"));
  assert.ok(summary.warnings.some((warning) => warning.code === "COST_PRESSURE"));
  assert.ok(summary.warnings.some((warning) => warning.code === "REVIEW_BACKLOG"));
  assert.ok(summary.warnings.some((warning) => warning.code === "STALE_FIELD_REPORTING"));
}

function testPortfolioAggregation() {
  const summary = buildPortfolioPlanFactSummary(snapshot, {
    referenceDate,
  });

  assert.equal(summary.totals.projectCount, 2);
  assert.equal(summary.totals.projectsBehindPlan, 1);
  assert.equal(summary.totals.projectsOverBudget, 2);
  assert.equal(summary.totals.pendingReviewProjects, 1);
  assert.ok(summary.totals.cpi !== null);
  assert.ok(summary.totals.spi !== null);
  assert.ok(summary.topSignals.length > 0);
  assert.equal(summary.topSignals[0]?.projectId, "project-alpha");
}

function testCostPressureWordingForLowEfficiencyWithoutOverspend() {
  const efficiencySnapshot: ExecutiveSnapshot = {
    ...snapshot,
    projects: snapshot.projects.map((project) =>
      project.id === "project-beta"
        ? {
            ...project,
            progress: 10,
            budget: {
              ...project.budget,
              actual: 500,
            },
          }
        : project
    ),
    tasks: snapshot.tasks.map((task) =>
      task.projectId === "project-beta" && task.status === "done"
        ? {
            ...task,
            status: "todo",
            completedAt: undefined,
          }
        : task
    ),
  };

  const summary = buildProjectPlanFactSummary(efficiencySnapshot, "project-beta", {
    referenceDate,
  });
  const costPressure = summary.warnings.find((warning) => warning.code === "COST_PRESSURE");

  assert.ok(costPressure);
  assert.equal(costPressure?.title, "Cost efficiency is below target");
  assert.equal(costPressure?.metrics?.overspending, 0);
}

function main() {
  testProjectPlanFactSummary();
  testPortfolioAggregation();
  testCostPressureWordingForLowEfficiencyWithoutOverspend();
  console.log("PASS plan-fact.service.unit");
}

main();
