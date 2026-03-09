import { addDays, format } from "date-fns";

import type {
  AIActionProposal,
  AIAdapter,
  AIContextSnapshot,
  AIRunInput,
  AIRunRecord,
  AIQuickActionKind,
} from "@/lib/ai/types";

type MockStoreEntry = {
  input: AIRunInput;
  startedAt: number;
  run: AIRunRecord;
  finalRun?: AIRunRecord;
};

const runStore = new Map<string, MockStoreEntry>();

const copy = {
  ru: {
    untitledRun: "AI Workspace Run",
    portfolioRun: "Портфельный бриф",
    projectRun: "Разбор проекта",
    tasksRun: "План задач",
    reportRun: "Черновик статуса",
    triageRun: "Разбор очереди задач",
    portfolioSummary:
      "Портфель держится на активных проектах, но зона риска остаётся в логистическом и северном контуре. Ниже кратко собраны самые заметные сигналы для управленческого решения.",
    projectSummary:
      "Проект требует точечного управленческого вмешательства: срок, бюджет и блокеры уже влияют на предсказуемость delivery. Ниже выделены основные узкие места и ближайшие действия.",
    taskPlanSummary:
      "Я собрал короткий план задач, который можно применить только после подтверждения. Он сфокусирован на ближайшей неделе и не меняет существующие сущности без approval.",
    reportSummary:
      "Ниже draft-версия статуса, которую можно использовать как основу для weekly update без ручного сбора всех сигналов.",
    triageSummary:
      "Очередь задач требует сортировки по блокерам и срокам. Я собрал краткий triage-пакет для текущего execution layer.",
    portfolioNextStep1: "Провести 20-минутный review по проектам со статусом at risk.",
    portfolioNextStep2: "Согласовать owner для просроченных задач на текущей неделе.",
    portfolioNextStep3: "Использовать статус-драфт как основу для weekly executive update.",
    projectNextStep1: "Закрепить один owner за главным blocker и обновить срок до конца дня.",
    projectNextStep2: "Сверить cash / budget variance перед следующим решением по приоритетам.",
    projectNextStep3: "Перевести AI proposal в реальные задачи только после проверки команды.",
    reportNextStep1: "Проверить цифры бюджета и health перед отправкой стейкхолдерам.",
    reportNextStep2: "Добавить один decision ask, если проект находится в зоне риска.",
    triageNextStep1: "Поднять blocked-задачи в отдельный ежедневный контроль.",
    triageNextStep2: "Перераспределить задачи с ближайшим сроком между доступными owners.",
    proposalTitle: "AI предлагает создать пакет задач",
    proposalSummary:
      "Пакет рассчитан на короткий recovery / execution cycle и не будет применён без вашего подтверждения.",
    proposalReasonBlocked: "Снять blocker и вернуть поток в предсказуемый execution.",
    proposalReasonBudget: "Сверить бюджет и сроки до следующего управленческого окна.",
    proposalReasonReport: "Подготовить прозрачный статус для руководительского апдейта.",
  },
  en: {
    untitledRun: "AI Workspace Run",
    portfolioRun: "Portfolio brief",
    projectRun: "Project diagnosis",
    tasksRun: "Task proposal pack",
    reportRun: "Status draft",
    triageRun: "Task triage",
    portfolioSummary:
      "The portfolio is carried by active workstreams, but the logistics and northern delivery tracks still concentrate most of the risk. The main management signals are summarized below.",
    projectSummary:
      "This project needs targeted intervention: schedule, budget, and blockers are already reducing delivery predictability. The main constraints and next moves are summarized below.",
    taskPlanSummary:
      "I prepared a short task package that can be applied only after explicit approval. It focuses on the next week and does not mutate existing entities automatically.",
    reportSummary:
      "Below is a draft status update that can be reused as the starting point for a weekly stakeholder report.",
    triageSummary:
      "The task queue needs triage around blockers and due dates. I assembled a compact execution package for the current task layer.",
    portfolioNextStep1: "Run a 20-minute review for every at-risk project.",
    portfolioNextStep2: "Assign a single owner to each overdue task this week.",
    portfolioNextStep3: "Use the status draft as the base for the executive weekly update.",
    projectNextStep1: "Assign one owner to the main blocker and refresh the due date today.",
    projectNextStep2: "Reconcile budget variance before the next prioritization decision.",
    projectNextStep3: "Apply the AI proposal only after the team reviews the task pack.",
    reportNextStep1: "Validate budget numbers and health before sending to stakeholders.",
    reportNextStep2: "Add one explicit decision ask if the project remains at risk.",
    triageNextStep1: "Track blocked tasks in a separate daily control loop.",
    triageNextStep2: "Rebalance the nearest due tasks across available owners.",
    proposalTitle: "AI suggests creating a task package",
    proposalSummary:
      "The package is designed for a short recovery / execution cycle and will not be applied without your approval.",
    proposalReasonBlocked: "Remove the blocker and return the workflow to predictable execution.",
    proposalReasonBudget: "Reconcile budget and schedule before the next decision window.",
    proposalReasonReport: "Prepare a transparent status update for leadership.",
  },
  zh: {
    untitledRun: "AI Workspace Run",
    portfolioRun: "项目组合简报",
    projectRun: "项目诊断",
    tasksRun: "任务方案包",
    reportRun: "状态草稿",
    triageRun: "任务分流",
    portfolioSummary:
      "当前项目组合主要依赖活跃项目支撑，但物流与北方交付链路仍然聚集了大部分风险。下面汇总了最关键的管理信号。",
    projectSummary:
      "该项目需要定点干预：进度、预算和阻塞已经在削弱交付可预测性。下面是主要约束与下一步动作。",
    taskPlanSummary:
      "我准备了一组短周期任务方案，只会在你确认后应用。它聚焦未来一周，不会自动改写现有实体。",
    reportSummary:
      "下面是一份状态更新草稿，可以直接作为每周干系人汇报的起点。",
    triageSummary:
      "当前任务队列需要围绕阻塞与截止日期重新分流。我已经整理了一份紧凑的执行包。",
    portfolioNextStep1: "对所有风险中的项目进行 20 分钟管理复盘。",
    portfolioNextStep2: "为本周所有逾期任务指定唯一 owner。",
    portfolioNextStep3: "将状态草稿作为高层周报的基础版本。",
    projectNextStep1: "为主要 blocker 指定唯一 owner，并在今天更新目标日期。",
    projectNextStep2: "在下次优先级决策前核对预算偏差。",
    projectNextStep3: "仅在团队确认后再应用 AI 任务方案。",
    reportNextStep1: "发送给干系人前先确认预算和 health 数字。",
    reportNextStep2: "如果项目仍处于风险中，加入一个明确的决策请求。",
    triageNextStep1: "把 blocked 任务纳入单独的日控回路。",
    triageNextStep2: "在可用 owners 之间重分配最近到期的任务。",
    proposalTitle: "AI 建议创建一组任务",
    proposalSummary:
      "这组任务面向短周期恢复 / 执行，不会在未获批准前自动应用。",
    proposalReasonBlocked: "解除 blocker，让执行流恢复可预测性。",
    proposalReasonBudget: "在下一个决策窗口前核对预算与进度。",
    proposalReasonReport: "为管理层准备透明的状态更新。",
  },
} as const;

function createRunId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `ai-run-${crypto.randomUUID()}`;
  }

  return `ai-run-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneRun(run: AIRunRecord) {
  return JSON.parse(JSON.stringify(run)) as AIRunRecord;
}

function resolveKind(input: AIRunInput): AIQuickActionKind {
  if (input.quickAction) {
    return input.quickAction.kind;
  }

  if (
    [
      "execution-planner",
      "resource-allocator",
      "timeline-optimizer",
    ].includes(input.agent.id) &&
    input.context.activeContext.type === "project"
  ) {
    return "suggest_tasks";
  }

  if (
    [
      "status-reporter",
      "telegram-bridge",
      "email-digest",
      "meeting-notes",
      "document-writer",
      "translator",
    ].includes(input.agent.id)
  ) {
    return "draft_status_report";
  }

  if (
    ["risk-researcher", "quality-guardian", "search-agent", "knowledge-keeper", "best-practices"].includes(
      input.agent.id
    )
  ) {
    return input.context.activeContext.type === "tasks" ? "triage_tasks" : "analyze_project";
  }

  if (["budget-controller", "evm-analyst", "cost-predictor"].includes(input.agent.id)) {
    return "draft_status_report";
  }

  const prompt = input.prompt.toLowerCase();
  if (/task|задач|任务|plan|план/.test(prompt) && input.context.activeContext.type === "project") {
    return "suggest_tasks";
  }
  if (/report|status|отч[её]т|статус|报告/.test(prompt)) {
    return "draft_status_report";
  }
  if (input.context.activeContext.type === "tasks") {
    return "triage_tasks";
  }
  if (input.context.activeContext.type === "project") {
    return "analyze_project";
  }
  return "summarize_portfolio";
}

function getProjectSnapshot(context: AIContextSnapshot) {
  return (
    context.project ??
    (context.activeContext.projectId
      ? context.projects.find((project) => project.id === context.activeContext.projectId)
      : undefined)
  );
}

function buildProposal(context: AIContextSnapshot): AIActionProposal | null {
  const localeCopy = copy[context.locale];
  const project = getProjectSnapshot(context);
  if (!project) return null;

  const tasks = context.tasks.filter((task) => task.projectId === project.id);
  const openTasks = tasks.filter((task) => task.status !== "done");
  const primaryOwner = project.team[0] ?? "Owner";
  const secondaryOwner = project.team[1] ?? primaryOwner;
  const blockedTask = openTasks.find((task) => task.status === "blocked") ?? openTasks[0];
  const latestRisk = context.risks.find((risk) => risk.projectId === project.id && risk.status === "open");

  return {
    id: `proposal-${project.id}`,
    type: "create_tasks",
    title: localeCopy.proposalTitle,
    summary: localeCopy.proposalSummary,
    state: "pending",
    tasks: [
      {
        projectId: project.id,
        title: blockedTask
          ? `${blockedTask.title}: owner sync`
          : `${project.name}: unblock main dependency`,
        description: blockedTask?.description ?? localeCopy.proposalReasonBlocked,
        assignee: primaryOwner,
        dueDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
        priority: project.priority === "critical" ? "critical" : "high",
        reason: localeCopy.proposalReasonBlocked,
      },
      {
        projectId: project.id,
        title: `${project.name}: budget and milestone checkpoint`,
        description: latestRisk?.mitigation ?? localeCopy.proposalReasonBudget,
        assignee: secondaryOwner,
        dueDate: format(addDays(new Date(), 4), "yyyy-MM-dd"),
        priority: "high",
        reason: localeCopy.proposalReasonBudget,
      },
      {
        projectId: project.id,
        title: `${project.name}: prepare decision update`,
        description: localeCopy.proposalReasonReport,
        assignee: primaryOwner,
        dueDate: format(addDays(new Date(), 6), "yyyy-MM-dd"),
        priority: "medium",
        reason: localeCopy.proposalReasonReport,
      },
    ],
  };
}

function buildHighlights(kind: AIQuickActionKind, context: AIContextSnapshot) {
  const project = getProjectSnapshot(context);
  const openTasks = context.tasks.filter((task) => task.status !== "done");
  const overdueTasks = openTasks.filter((task) => task.dueDate <= format(new Date(), "yyyy-MM-dd"));
  const atRiskProjects = context.projects.filter((item) => item.status === "at-risk");

  if (kind === "summarize_portfolio") {
    return [
      `${context.projects.length} projects in scope, ${atRiskProjects.length} currently at risk.`,
      `${overdueTasks.length} overdue tasks require owner assignment this week.`,
      `Highest pressure point: ${atRiskProjects[0]?.name ?? context.projects[0]?.name ?? context.activeContext.title}.`,
    ];
  }

  if (kind === "triage_tasks") {
    return [
      `${overdueTasks.length} overdue tasks are competing with ${openTasks.length} active items.`,
      `${context.tasks.filter((task) => task.status === "blocked").length} tasks are blocked right now.`,
      `Best starting point: move one owner onto the nearest due critical item.`,
    ];
  }

  if (!project) {
    return [
      `No project snapshot found for ${context.activeContext.title}.`,
      `Run is limited to the current local dashboard state.`,
      `Switch to a project page for deeper analysis.`,
    ];
  }

  const projectTasks = context.tasks.filter((task) => task.projectId === project.id);
  const blockedCount = projectTasks.filter((task) => task.status === "blocked").length;
  const openRiskCount = context.risks.filter(
    (risk) => risk.projectId === project.id && risk.status === "open"
  ).length;

  return [
    `${project.name}: health ${project.health}% with progress ${project.progress}%.`,
    `${projectTasks.filter((task) => task.status !== "done").length} open tasks, ${blockedCount} blocked.`,
    `${openRiskCount} open risks and next milestone ${project.nextMilestone?.date ?? project.dates.end}.`,
  ];
}

export function buildMockFinalRun(
  input: AIRunInput,
  seed?: Partial<Pick<AIRunRecord, "id" | "createdAt" | "updatedAt" | "quickActionId">>
): AIRunRecord {
  const localeCopy = copy[input.context.locale];
  const project = getProjectSnapshot(input.context);
  const kind = resolveKind(input);
  const timestamp = seed?.updatedAt ?? new Date().toISOString();
  const baseRun: AIRunRecord = {
    id: seed?.id ?? createRunId(),
    agentId: input.agent.id,
    title: localeCopy.untitledRun,
    prompt: input.prompt,
    quickActionId: seed?.quickActionId ?? input.quickAction?.id,
    status: "done",
    createdAt: seed?.createdAt ?? timestamp,
    updatedAt: timestamp,
    context: input.context.activeContext,
  };

  const titles = {
    summarize_portfolio: localeCopy.portfolioRun,
    analyze_project: localeCopy.projectRun,
    suggest_tasks: localeCopy.tasksRun,
    draft_status_report: localeCopy.reportRun,
    triage_tasks: localeCopy.triageRun,
  } as const;

  const summaries = {
    summarize_portfolio: localeCopy.portfolioSummary,
    analyze_project: localeCopy.projectSummary,
    suggest_tasks: localeCopy.taskPlanSummary,
    draft_status_report: localeCopy.reportSummary,
    triage_tasks: localeCopy.triageSummary,
  } as const;

  const nextSteps = {
    summarize_portfolio: [
      localeCopy.portfolioNextStep1,
      localeCopy.portfolioNextStep2,
      localeCopy.portfolioNextStep3,
    ],
    analyze_project: [
      localeCopy.projectNextStep1,
      localeCopy.projectNextStep2,
      localeCopy.projectNextStep3,
    ],
    suggest_tasks: [
      localeCopy.projectNextStep1,
      localeCopy.projectNextStep2,
      localeCopy.projectNextStep3,
    ],
    draft_status_report: [localeCopy.reportNextStep1, localeCopy.reportNextStep2],
    triage_tasks: [localeCopy.triageNextStep1, localeCopy.triageNextStep2],
  } as const;

  const proposal = kind === "suggest_tasks" ? buildProposal(input.context) : null;
  const summarySuffix =
    project && kind !== "summarize_portfolio" && kind !== "triage_tasks"
      ? ` ${project.name}.`
      : "";

  return {
    ...baseRun,
    title: titles[kind],
    status: proposal ? "needs_approval" : "done",
    updatedAt: timestamp,
    result: {
      title: titles[kind],
      summary: `${summaries[kind]}${summarySuffix}`,
      highlights: buildHighlights(kind, input.context),
      nextSteps: [...nextSteps[kind]],
      proposal,
    },
  };
}

export function applyMockProposal(run: AIRunRecord, proposalId: string): AIRunRecord {
  const proposal = run.result?.proposal;
  if (!proposal || proposal.id !== proposalId) {
    throw new Error(`Proposal ${proposalId} not found in run ${run.id}`);
  }

  const result = run.result;
  if (!result) {
    throw new Error(`Run ${run.id} has no result payload`);
  }

  return {
    ...run,
    status: "done",
    updatedAt: new Date().toISOString(),
    result: {
      ...result,
      proposal: {
        ...proposal,
        state: "applied",
      },
    },
  };
}

export function createMockAIAdapter(): AIAdapter {
  return {
    mode: "mock",
    async runAgent(input) {
      const now = new Date().toISOString();
      const runId = createRunId();
      const run: AIRunRecord = {
        id: runId,
        agentId: input.agent.id,
        title: copy[input.context.locale].untitledRun,
        prompt: input.prompt,
        quickActionId: input.quickAction?.id,
        status: "queued",
        createdAt: now,
        updatedAt: now,
        context: input.context.activeContext,
      };

      runStore.set(runId, {
        input,
        startedAt: Date.now(),
        run,
      });

      return cloneRun(run);
    },
    async getRun(runId) {
      const entry = runStore.get(runId);
      if (!entry) {
        throw new Error(`AI run ${runId} not found`);
      }

      const elapsed = Date.now() - entry.startedAt;
      if (elapsed < 550) {
        return cloneRun({
          ...entry.run,
          status: "queued",
          updatedAt: new Date().toISOString(),
        });
      }

      if (elapsed < 1800) {
        return cloneRun({
          ...entry.run,
          status: "running",
          updatedAt: new Date().toISOString(),
        });
      }

      if (!entry.finalRun) {
        const finalRun = buildMockFinalRun(entry.input);
        finalRun.id = entry.run.id;
        finalRun.createdAt = entry.run.createdAt;
        finalRun.quickActionId = entry.run.quickActionId;
        entry.finalRun = finalRun;
      }

      return cloneRun(entry.finalRun);
    },
    async applyProposal({ proposalId, runId }) {
      const entry = runStore.get(runId);
      if (!entry) {
        throw new Error(`AI run ${runId} not found`);
      }

      if (!entry.finalRun) {
        entry.finalRun = buildMockFinalRun(entry.input);
        entry.finalRun.id = entry.run.id;
        entry.finalRun.createdAt = entry.run.createdAt;
      }

      entry.finalRun = applyMockProposal(entry.finalRun, proposalId);

      return cloneRun(entry.finalRun);
    },
  };
}
