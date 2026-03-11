import { getProposalItemCount, getProposalPreviewItems } from "@/lib/ai/action-engine";
import {
  getServerAIRunEntry,
  type ServerAIRunEntry,
  type ServerAIRunOrigin,
} from "@/lib/ai/server-runs";
import type { AIRunStatus, AIRunSourceRef } from "@/lib/ai/types";

export type AIRunTraceStepStatus =
  | "pending"
  | "running"
  | "done"
  | "failed"
  | "not_applicable";

export interface AIRunTraceSourceSummary extends AIRunSourceRef {
  workflowLabel: string;
  purposeLabel: string | null;
}

export interface AIRunTraceFactSummary {
  projects: number;
  tasks: number;
  risks: number;
  team: number;
  notifications: number;
}

export interface AIRunTraceStep {
  id: string;
  label: string;
  status: AIRunTraceStepStatus;
  summary: string;
  startedAt?: string;
  endedAt?: string;
}

export interface AIRunTraceProposalSummary {
  type: string | null;
  state: string | null;
  title: string | null;
  summary: string | null;
  itemCount: number;
  previewItems: string[];
}

export interface AIRunTraceApplySummary {
  appliedAt: string;
  itemCount: number;
  summary: string;
}

export interface AIRunTrace {
  runId: string;
  workflow: string;
  title: string;
  status: AIRunStatus;
  agentId: string;
  quickActionId: string | null;
  origin: ServerAIRunOrigin;
  model: {
    name: string;
    status: AIRunTraceStepStatus;
  };
  source: AIRunTraceSourceSummary;
  context: {
    type: string;
    title: string;
    pathname: string;
    projectId?: string;
    facts: AIRunTraceFactSummary;
  };
  proposal: AIRunTraceProposalSummary;
  apply: AIRunTraceApplySummary | null;
  promptPreview: string;
  createdAt: string;
  updatedAt: string;
  steps: AIRunTraceStep[];
  failure: {
    message: string;
  } | null;
}

function formatWorkflowLabel(workflow: string) {
  switch (workflow) {
    case "work_report_signal_packet":
      return "Work-report signal packet";
    case "meeting_to_action":
      return "Meeting-to-action";
    default:
      return workflow.replace(/[_-]+/g, " ");
  }
}

function formatPurposeLabel(purpose?: string) {
  if (!purpose) return null;

  switch (purpose) {
    case "tasks":
      return "Execution patch";
    case "risks":
      return "Risk additions";
    case "status":
      return "Executive status draft";
    default:
      return purpose.replace(/[_-]+/g, " ");
  }
}

function trimPrompt(prompt: string, maxLength = 360) {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

function resolveSource(entry: ServerAIRunEntry): AIRunTraceSourceSummary {
  const source = entry.input.source;
  if (source) {
    return {
      ...source,
      workflowLabel: formatWorkflowLabel(source.workflow),
      purposeLabel: formatPurposeLabel(source.purpose),
    };
  }

  return {
    workflow: "direct_ai_run",
    workflowLabel: "Direct AI run",
    purposeLabel: null,
    entityType: entry.run.context.type,
    entityId: entry.run.context.projectId ?? entry.run.id,
    entityLabel: entry.run.context.title,
  };
}

function resolveFacts(entry: ServerAIRunEntry): AIRunTraceFactSummary {
  const currentProjectId =
    entry.input.context.project?.id ?? entry.input.context.activeContext.projectId;
  const relevantRisks = currentProjectId
    ? entry.input.context.risks.filter((risk) => risk.projectId === currentProjectId)
    : entry.input.context.risks;

  return {
    projects: entry.input.context.projects.length,
    tasks: (entry.input.context.projectTasks ?? entry.input.context.tasks).length,
    risks: relevantRisks.length,
    team: entry.input.context.team.length,
    notifications: entry.input.context.notifications.length,
  };
}

function resolveModelName(origin: ServerAIRunOrigin) {
  if (origin === "gateway") {
    return process.env.OPENCLAW_GATEWAY_MODEL?.trim() || "openclaw:main";
  }

  return "mock-adapter";
}

function resolveModelStatus(status: AIRunStatus): AIRunTraceStepStatus {
  switch (status) {
    case "queued":
      return "pending";
    case "running":
      return "running";
    case "failed":
      return "failed";
    case "needs_approval":
    case "done":
    default:
      return "done";
  }
}

function resolveProposalStatus(entry: ServerAIRunEntry): AIRunTraceStepStatus {
  if (entry.run.result?.proposal) {
    return "done";
  }

  switch (entry.run.status) {
    case "queued":
      return "pending";
    case "running":
      return "running";
    case "failed":
      return "failed";
    case "needs_approval":
    case "done":
    default:
      return "not_applicable";
  }
}

function resolveApplyStatus(entry: ServerAIRunEntry): AIRunTraceStepStatus {
  if (entry.run.result?.actionResult) {
    return "done";
  }

  const proposalState = entry.run.result?.proposal?.state;
  if (proposalState === "pending") {
    return "pending";
  }

  if (proposalState === "applied") {
    return "done";
  }

  if (proposalState === "dismissed") {
    return "not_applicable";
  }

  return "not_applicable";
}

function buildProposalSummary(entry: ServerAIRunEntry): AIRunTraceProposalSummary {
  const proposal = entry.run.result?.proposal;
  if (!proposal) {
    return {
      type: null,
      state: null,
      title: null,
      summary: null,
      itemCount: 0,
      previewItems: [],
    };
  }

  return {
    type: proposal.type,
    state: proposal.state,
    title: proposal.title,
    summary: proposal.summary,
    itemCount: getProposalItemCount(proposal),
    previewItems: getProposalPreviewItems(proposal)
      .slice(0, 3)
      .map((item) => item.title),
  };
}

function buildApplySummary(entry: ServerAIRunEntry): AIRunTraceApplySummary | null {
  const actionResult = entry.run.result?.actionResult;
  if (!actionResult) {
    return null;
  }

  return {
    appliedAt: actionResult.appliedAt,
    itemCount: actionResult.itemCount,
    summary: actionResult.summary,
  };
}

function buildSteps(entry: ServerAIRunEntry, source: AIRunTraceSourceSummary, facts: AIRunTraceFactSummary) {
  const proposal = entry.run.result?.proposal;
  const proposalItemCount = proposal ? getProposalItemCount(proposal) : 0;
  const modelStatus = resolveModelStatus(entry.run.status);
  const proposalStatus = resolveProposalStatus(entry);
  const applyStatus = resolveApplyStatus(entry);

  return [
    {
      id: "source",
      label: "Source packet",
      status: "done",
      summary: source.packetId
        ? `${source.entityType} ${source.entityLabel} from ${source.workflowLabel}.`
        : `${source.entityType} ${source.entityLabel}.`,
      startedAt: entry.run.createdAt,
      endedAt: entry.run.createdAt,
    },
    {
      id: "facts",
      label: "Facts loaded",
      status: "done",
      summary: `Projects ${facts.projects}, tasks ${facts.tasks}, risks ${facts.risks}, team ${facts.team}, notifications ${facts.notifications}.`,
      startedAt: entry.run.createdAt,
      endedAt: entry.run.createdAt,
    },
    {
      id: "model",
      label: "Model run",
      status: modelStatus,
      summary:
        modelStatus === "pending"
          ? `Queued in ${entry.origin} mode for ${resolveModelName(entry.origin)}.`
          : modelStatus === "running"
            ? `Executing ${resolveModelName(entry.origin)} in ${entry.origin} mode.`
            : modelStatus === "failed"
              ? entry.run.errorMessage ?? "Model execution failed."
              : proposal
                ? `${resolveModelName(entry.origin)} returned an approval-gated proposal.`
                : `${resolveModelName(entry.origin)} returned a summary-only answer.`,
      startedAt: entry.run.createdAt,
      endedAt:
        modelStatus === "pending" || modelStatus === "running" ? undefined : entry.run.updatedAt,
    },
    {
      id: "proposal",
      label: "Proposal artifact",
      status: proposalStatus,
      summary: proposal
        ? `${proposal.type} with ${proposalItemCount} item(s) is ${proposal.state}.`
        : proposalStatus === "not_applicable"
          ? "No approval proposal was generated for this run."
          : proposalStatus === "failed"
            ? entry.run.errorMessage ?? "Proposal generation failed."
            : "Waiting for proposal output.",
      startedAt: entry.run.createdAt,
      endedAt:
        proposalStatus === "pending" || proposalStatus === "running" ? undefined : entry.run.updatedAt,
    },
    {
      id: "apply",
      label: "Operator apply",
      status: applyStatus,
      summary: entry.run.result?.actionResult
        ? entry.run.result.actionResult.summary
        : proposal?.state === "pending"
          ? "Waiting for operator approval."
          : proposal?.state === "dismissed"
            ? "Proposal was dismissed and not applied."
            : "No apply action has been executed.",
      startedAt: entry.run.result?.actionResult?.appliedAt ?? entry.run.updatedAt,
      endedAt: entry.run.result?.actionResult?.appliedAt,
    },
  ] satisfies AIRunTraceStep[];
}

export function buildAIRunTrace(entry: ServerAIRunEntry): AIRunTrace {
  const source = resolveSource(entry);
  const facts = resolveFacts(entry);
  const workflow = source.workflow;

  return {
    runId: entry.run.id,
    workflow,
    title: entry.run.title,
    status: entry.run.status,
    agentId: entry.run.agentId,
    quickActionId: entry.run.quickActionId ?? null,
    origin: entry.origin,
    model: {
      name: resolveModelName(entry.origin),
      status: resolveModelStatus(entry.run.status),
    },
    source,
    context: {
      type: entry.run.context.type,
      title: entry.run.context.title,
      pathname: entry.run.context.pathname,
      projectId: entry.run.context.projectId,
      facts,
    },
    proposal: buildProposalSummary(entry),
    apply: buildApplySummary(entry),
    promptPreview: trimPrompt(entry.input.prompt),
    createdAt: entry.run.createdAt,
    updatedAt: entry.run.updatedAt,
    steps: buildSteps(entry, source, facts),
    failure: entry.run.errorMessage ? { message: entry.run.errorMessage } : null,
  };
}

export async function getServerAIRunTrace(runId: string) {
  const entry = await getServerAIRunEntry(runId);
  return buildAIRunTrace(entry);
}
