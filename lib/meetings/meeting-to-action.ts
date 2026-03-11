import { getAgentById } from "@/lib/ai/agents";
import { loadServerAIContext } from "@/lib/ai/server-context";
import { createServerAIRun } from "@/lib/ai/server-runs";
import type { AIContextSnapshot, AIRunInput, AIRunRecord } from "@/lib/ai/types";

import type {
  MeetingRunBlueprint,
  MeetingToActionPacket,
  MeetingToActionRequest,
} from "./types";

interface MeetingToActionDeps {
  createRun?: (input: AIRunInput) => Promise<AIRunRecord>;
  loadContext?: (input: {
    projectId: string;
    locale?: MeetingToActionRequest["locale"];
    interfaceLocale?: MeetingToActionRequest["interfaceLocale"];
    subtitle?: string;
    title?: string;
  }) => Promise<AIContextSnapshot>;
  now?: () => Date;
  packetIdFactory?: () => string;
}

export async function createMeetingToActionPacket(
  request: MeetingToActionRequest,
  deps: MeetingToActionDeps = {}
): Promise<MeetingToActionPacket> {
  const now = deps.now ?? (() => new Date());
  const packetIdFactory = deps.packetIdFactory ?? createPacketId;
  const loadContext =
    deps.loadContext ??
    ((input: {
      projectId: string;
      locale?: MeetingToActionRequest["locale"];
      interfaceLocale?: MeetingToActionRequest["interfaceLocale"];
      subtitle?: string;
      title?: string;
    }) =>
      loadServerAIContext({
        projectId: input.projectId,
        locale: input.locale,
        interfaceLocale: input.interfaceLocale,
        pathname: `/projects/${input.projectId}`,
        subtitle: input.subtitle,
        title: input.title,
      }));
  const createRun = deps.createRun ?? createServerAIRun;
  const createdAt = now().toISOString();

  const context = await loadContext({
    projectId: request.projectId,
    locale: request.locale,
    interfaceLocale: request.interfaceLocale,
    subtitle: request.title
      ? `Meeting-to-action intake: ${request.title}`
      : "Meeting-to-action intake",
  });

  const project = context.project;
  if (!project) {
    throw new Error(`Project "${request.projectId}" was not found.`);
  }

  const title = request.title?.trim() || `Meeting follow-up for ${project.name}`;
  const participants = normalizeParticipants(request.participants);
  const blueprints = buildMeetingRunBlueprints(context, {
    ...request,
    title,
    participants,
  });

  const runs = await Promise.all(
    blueprints.map(async (blueprint) => ({
      purpose: blueprint.purpose,
      label: blueprint.label,
      pollPath: `/api/ai/runs`,
      run: await createRun(blueprint.input),
    }))
  );

  return {
    packetId: packetIdFactory(),
    createdAt,
    projectId: project.id,
    projectName: project.name,
    title,
    participants,
    noteStats: {
      characters: request.notes.length,
      lines: request.notes.split(/\n+/).filter(Boolean).length,
    },
    runs: runs.map((entry) => ({
      ...entry,
      pollPath: `/api/ai/runs/${entry.run.id}`,
    })),
  };
}

export function buildMeetingRunBlueprints(
  context: AIContextSnapshot,
  request: Required<Pick<MeetingToActionRequest, "notes" | "projectId" | "title">> &
    Pick<MeetingToActionRequest, "locale"> & { participants: string[] }
): MeetingRunBlueprint[] {
  const planner = requireAgent("execution-planner");
  const riskResearcher = requireAgent("risk-researcher");
  const meetingReporter = requireAgent("meeting-notes");
  const projectName = context.project?.name ?? context.activeContext.title;
  const locale = request.locale ?? context.locale;
  const participantsBlock =
    request.participants.length > 0
      ? request.participants.join(", ")
      : locale === "ru"
        ? "не указаны"
        : locale === "zh"
          ? "未提供"
          : "not provided";

  return [
    {
      purpose: "tasks",
      label: "Action tasks",
      input: {
        agent: planner,
        context,
        prompt: [
          `Meeting-to-action for project ${projectName}.`,
          `Meeting title: ${request.title}.`,
          `Participants: ${participantsBlock}.`,
          "Create concrete follow-up tasks from the meeting notes.",
          "Focus on owners, due dates, blockers, dependencies, and the next 7-day execution window.",
          "If the notes mention open decisions, convert them into task drafts instead of generic advice.",
          "Meeting notes:",
          request.notes,
        ].join("\n"),
      },
    },
    {
      purpose: "risks",
      label: "Risk register additions",
      input: {
        agent: riskResearcher,
        context,
        prompt: [
          `Meeting-to-action risk scan for project ${projectName}.`,
          `Meeting title: ${request.title}.`,
          `Participants: ${participantsBlock}.`,
          "Identify project risks and blockers from the meeting notes.",
          "Raise risks when schedule, budget, supplier, stakeholder, quality, or dependency exposure is visible.",
          "Prefer concrete risk statements over generic commentary.",
          "Meeting notes:",
          request.notes,
        ].join("\n"),
      },
    },
    {
      purpose: "status",
      label: "Status update draft",
      input: {
        agent: meetingReporter,
        context,
        prompt: [
          `Meeting-to-action status report for project ${projectName}.`,
          `Meeting title: ${request.title}.`,
          `Participants: ${participantsBlock}.`,
          "Draft a concise status report from the meeting notes.",
          "Summarize decisions, delivery status, blockers, risks, asks, and the next management checkpoint.",
          "Use the notes as the primary source of truth for the summary.",
          "Meeting notes:",
          request.notes,
        ].join("\n"),
      },
    },
  ];
}

function normalizeParticipants(participants?: string[]) {
  return (participants ?? []).map((item) => item.trim()).filter(Boolean);
}

function requireAgent(agentId: string) {
  const agent = getAgentById(agentId);
  if (!agent) {
    throw new Error(`Agent "${agentId}" was not found.`);
  }

  return agent;
}

function createPacketId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `meeting-packet-${crypto.randomUUID()}`;
  }

  return `meeting-packet-${Math.random().toString(36).slice(2, 10)}`;
}
