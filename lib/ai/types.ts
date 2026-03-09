import type { Locale, MessageKey } from "@/lib/translations";
import type {
  NotificationItem,
  Priority,
  Project,
  Risk,
  Task,
  TeamMember,
} from "@/lib/types";

export type AIAdapterMode = "mock" | "gateway";
export type AIWorkspaceMode = "auto" | AIAdapterMode;

export type AIRunStatus =
  | "queued"
  | "running"
  | "needs_approval"
  | "done"
  | "failed";

export type AIProposalState = "pending" | "applied" | "dismissed";

export type AIAgentKind = "analyst" | "planner" | "reporter" | "researcher";
export type AIAgentCategory =
  | "auto"
  | "strategic"
  | "planning"
  | "monitoring"
  | "financial"
  | "knowledge"
  | "communication"
  | "special";

export type AIContextType = "portfolio" | "project" | "tasks";

export type AIQuickActionKind =
  | "summarize_portfolio"
  | "analyze_project"
  | "suggest_tasks"
  | "draft_status_report"
  | "triage_tasks";

export interface AIContextRef {
  type: AIContextType;
  pathname: string;
  title: string;
  subtitle: string;
  projectId?: string;
}

export interface AIContextSnapshot {
  locale: Locale;
  interfaceLocale: Locale;
  generatedAt: string;
  activeContext: AIContextRef;
  projects: Project[];
  tasks: Task[];
  team: TeamMember[];
  risks: Risk[];
  notifications: NotificationItem[];
  project?: Project;
  projectTasks?: Task[];
}

export interface AIAgentDefinition {
  id: string;
  kind: AIAgentKind;
  nameKey: MessageKey;
  descriptionKey?: MessageKey;
  accentClass: string;
  icon: string;
  category: AIAgentCategory;
  recommended?: boolean;
}

export interface AIQuickActionDefinition {
  id: string;
  kind: AIQuickActionKind;
  agentId: string;
  labelKey: MessageKey;
  descriptionKey: MessageKey;
  promptKey: MessageKey;
  contextTypes: AIContextType[];
}

export interface AITaskDraft {
  projectId: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: Priority;
  reason: string;
}

export interface AIActionProposal {
  id: string;
  type: "create_tasks";
  title: string;
  summary: string;
  state: AIProposalState;
  tasks: AITaskDraft[];
}

export interface AIRunResult {
  title: string;
  summary: string;
  highlights: string[];
  nextSteps: string[];
  proposal?: AIActionProposal | null;
}

export interface AIRunRecord {
  id: string;
  sessionId?: string;
  agentId: string;
  title: string;
  prompt: string;
  quickActionId?: string;
  status: AIRunStatus;
  createdAt: string;
  updatedAt: string;
  context: AIContextRef;
  result?: AIRunResult;
  errorMessage?: string;
}

export interface AIRunInput {
  agent: AIAgentDefinition;
  prompt: string;
  context: AIContextSnapshot;
  quickAction?: AIQuickActionDefinition;
}

export interface AIApplyProposalInput {
  runId: string;
  proposalId: string;
}

export interface AIAdapter {
  mode: AIAdapterMode;
  runAgent: (input: AIRunInput) => Promise<AIRunRecord>;
  getRun: (runId: string) => Promise<AIRunRecord>;
  applyProposal: (input: AIApplyProposalInput) => Promise<AIRunRecord>;
}
