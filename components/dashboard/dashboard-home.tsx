"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  Clock3,
  FileText,
  FolderKanban,
  ListTodo,
  Users2,
  Plus,
} from "lucide-react";

import { useDashboard } from "@/components/dashboard-provider";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { ProjectCard } from "@/components/projects/project-card";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ClientChart } from "@/components/ui/client-chart";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartSkeleton, KpiCardSkeleton, ProjectCardSkeleton } from "@/components/ui/skeleton";
import { DataErrorState } from "@/components/ui/data-error-state";
import { useLocale } from "@/contexts/locale-context";
import { useDashboardSnapshot } from "@/lib/hooks/use-api";
import { usePortfolioHealth } from "@/lib/hooks/use-portfolio-health";
import { Project } from "@/lib/types";
import { leadingLabel, safePercent, cn } from "@/lib/utils";

const DashboardTrendChart = dynamic(
  () => import("@/components/dashboard/dashboard-trend-chart").then((module) => module.DashboardTrendChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const DashboardBudgetChart = dynamic(
  () => import("@/components/dashboard/dashboard-budget-chart").then((module) => module.DashboardBudgetChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const DashboardRiskChart = dynamic(
  () => import("@/components/dashboard/dashboard-risk-chart").then((module) => module.DashboardRiskChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function buildPortfolioTrend(
  projects: Project[],
  formatDateLocalized: (date: string, pattern?: string) => string
) {
  if (!projects.length) return [];

  const longestHistory = Math.max(...projects.map((project) => project.history.length));
  return Array.from({ length: longestHistory }, (_, index) => {
    const points = projects.map((project) => project.history[index]).filter(Boolean);

    return {
      name: points[0]?.date ? formatDateLocalized(points[0].date) : `P${index + 1}`,
      progress: Math.round(points.reduce((sum, point) => sum + point.progress, 0) / Math.max(points.length, 1)),
      actual: Math.round(points.reduce((sum, point) => sum + point.budgetActual, 0) / 1000),
      planned: Math.round(points.reduce((sum, point) => sum + point.budgetPlanned, 0) / 1000),
    };
  });
}

export function DashboardHome() {
  const { enumLabel, formatDateLocalized, locale, t } = useLocale();
  const {
    notifications,
    projects: providerProjects,
    risks: providerRisks,
    tasks: providerTasks,
    team: providerTeam,
    duplicateProject,
  } = useDashboard();
  
  const {
    error,
    isLoading,
    projects: snapshotProjects,
    retry,
    risks: snapshotRisks,
    tasks: snapshotTasks,
    team: snapshotTeam,
  } = useDashboardSnapshot();

  const [statusFilter, setStatusFilter] = useState<"all" | Project["status"]>("all");
  const [directionFilter, setDirectionFilter] = useState<"all" | Project["direction"]>("all");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const projects = snapshotProjects.length > 0 ? snapshotProjects : providerProjects;
  const tasks = snapshotTasks.length > 0 ? snapshotTasks : providerTasks;
  const team = snapshotTeam.length > 0 ? snapshotTeam : providerTeam;
  const risks = snapshotRisks.length > 0 ? snapshotRisks : providerRisks;

  const hasFallbackData = projects.length > 0 || tasks.length > 0 || team.length > 0 || risks.length > 0;

  const filteredProjects = projects.filter((project) => {
    const statusMatch = statusFilter === "all" ? true : project.status === statusFilter;
    const directionMatch = directionFilter === "all" ? true : project.direction === directionFilter;
    return statusMatch && directionMatch;
  });

  // Stats
  const totalPlanned = projects.reduce((sum, project) => sum + project.budget.planned, 0);
  const totalActual = projects.reduce((sum, project) => sum + project.budget.actual, 0);
  const budgetUsed = safePercent(totalActual, totalPlanned);
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;
  const openRiskCount = notifications.filter((notification) => notification.severity !== "info").length;
  const activeProjects = projects.filter((project) => project.status === "active").length;

  // Portfolio health
  const portfolioHealth = usePortfolioHealth();

  // Chart data
  const trendData = buildPortfolioTrend(projects, formatDateLocalized);
  const budgetData = projects.map((project) => ({
    name: leadingLabel(project.name),
    planned: Math.round(project.budget.planned / 100000),
    actual: Math.round(project.budget.actual / 100000),
  }));
  const riskData = [
    { name: enumLabel("severity", "critical"), value: notifications.filter((n) => n.severity === "critical").length, color: "#fb7185" },
    { name: enumLabel("severity", "warning"), value: notifications.filter((n) => n.severity === "warning").length, color: "#f59e0b" },
    { name: enumLabel("severity", "info"), value: notifications.filter((n) => n.severity === "info").length, color: "#38bdf8" },
  ];

  const showHydrationSkeleton = isLoading && projects.length === 0 && tasks.length === 0;

  if (showHydrationSkeleton) {
    return (
      <div className="grid gap-3">
        <div className="grid gap-2 grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <KpiCardSkeleton key={index} />
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="p-3">
            <div className="grid gap-2 grid-cols-2">
              {Array.from({ length: 6 }, (_, index) => (
                <ProjectCardSkeleton key={index} />
              ))}
            </div>
          </Card>
          <Card className="p-3">
            <ChartSkeleton className="h-48" />
          </Card>
        </div>
      </div>
    );
  }

  if (error && !hasFallbackData) {
    return (
      <DataErrorState
        actionLabel={t("action.retry")}
        description={t("error.loadDescription")}
        onRetry={retry}
        title={t("error.loadTitle")}
      />
    );
  }

  return (
    <>
      <div className="grid gap-3">
        {/* Compact KPI Row */}
        <div className="grid gap-2 grid-cols-6">
          <Card className="p-2">
            <p className="text-[10px] uppercase text-muted-foreground">{t("dashboard.kpi.activeProjects")}</p>
            <p className="text-lg font-bold">{activeProjects}</p>
          </Card>
          <Card className="p-2">
            <p className="text-[10px] uppercase text-muted-foreground">{t("dashboard.kpi.portfolioStatus")}</p>
            <p className={`text-lg font-bold ${(portfolioHealth?.overall ?? 0) >= 70 ? "text-green-600" : "text-amber-600"}`}>
              {portfolioHealth?.overall ?? 0}%
            </p>
          </Card>
          <Card className="p-2">
            <p className="text-[10px] uppercase text-muted-foreground">{t("tasks.total")}</p>
            <p className="text-lg font-bold">{totalTasks}</p>
          </Card>
          <Card className="p-2">
            <p className="text-[10px] uppercase text-muted-foreground">{t("tasks.inProgress")}</p>
            <p className="text-lg font-bold text-blue-600">{inProgressTasks}</p>
          </Card>
          <Card className="p-2">
            <p className="text-[10px] uppercase text-muted-foreground">{t("dashboard.criticalFeed")}</p>
            <p className={`text-lg font-bold ${openRiskCount > 0 ? "text-red-600" : "text-green-600"}`}>{openRiskCount}</p>
          </Card>
          <Card className="p-2">
            <p className="text-[10px] uppercase text-muted-foreground">{t("nav.team")}</p>
            <p className="text-lg font-bold">{team.length}</p>
          </Card>
        </div>

        {/* Main Grid: Projects + Sidebar */}
        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          {/* Left: Projects Grid + Charts */}
          <div className="grid gap-3">
            {/* Projects Grid */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium">{t("dashboard.projectsGrid")} ({filteredProjects.length})</h2>
                <div className="flex items-center gap-2">
                  <select
                    className="h-8 text-xs border rounded px-2"
                    onChange={(e) => setStatusFilter(e.target.value as "all" | Project["status"])}
                    value={statusFilter}
                  >
                    <option value="all">{t("filters.allStatuses")}</option>
                    <option value="active">{enumLabel("projectStatus", "active")}</option>
                    <option value="planning">{enumLabel("projectStatus", "planning")}</option>
                    <option value="at-risk">{enumLabel("projectStatus", "at-risk")}</option>
                    <option value="completed">{enumLabel("projectStatus", "completed")}</option>
                  </select>
                  <Button size="sm" onClick={() => setProjectModalOpen(true)} className="h-8">
                    <Plus className="h-3 w-3 mr-1" />
                    {t("action.addProject")}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.slice(0, 6).map((project) => (
                  <ProjectCard
                    key={project.id}
                    onDuplicate={duplicateProject}
                    onEdit={setEditingProject}
                    project={project}
                    taskCount={tasks.filter((task) => task.projectId === project.id && task.status !== "done").length}
                  />
                ))}
              </div>
            </Card>

            {/* Charts Grid */}
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="p-3">
                <h3 className="text-xs font-medium mb-2">{t("dashboard.progressVsBudget")}</h3>
                <ClientChart className="h-48">
                  <DashboardTrendChart data={trendData} />
                </ClientChart>
              </Card>
              <Card className="p-3">
                <h3 className="text-xs font-medium mb-2">{t("dashboard.budgetVariance")}</h3>
                <ClientChart className="h-48">
                  <DashboardBudgetChart data={budgetData} />
                </ClientChart>
              </Card>
            </div>

            {/* Budget Summary */}
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">{t("dashboard.kpi.budgetUsed")}</p>
                  <p className="text-xl font-bold">{totalActual.toLocaleString(locale === "zh" ? "zh-CN" : locale)} ₽</p>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={budgetUsed} className="w-32 h-2" />
                  <Badge variant={budgetUsed > 75 ? "warning" : "success"}>{budgetUsed}%</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="grid gap-3">
            {/* Critical Events */}
            <Card className="p-3">
              <h3 className="text-xs font-medium mb-2">{t("dashboard.criticalFeed")}</h3>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {notifications.slice(0, 3).map((notification) => (
                  <Link
                    key={notification.id}
                    className="block p-2 rounded border bg-[var(--panel-soft)]/40 hover:bg-[var(--panel-soft)]/60"
                    href={notification.projectId ? `/projects/${notification.projectId}` : "/"}
                  >
                    <p className="text-xs font-medium truncate">{notification.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{notification.description}</p>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Team Load */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium">{t("dashboard.teamLoad")}</h3>
                <span className="text-[10px] text-muted-foreground">{team.length} {t("dashboard.teamMembers")}</span>
              </div>
              {team.length === 0 ? (
                <div className="flex items-center justify-center h-[100px] text-xs text-muted-foreground">
                  {t("dashboard.noTeamMembers")}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {team.slice(0, 4).map((member) => {
                    const loadLevel = member.allocated >= 90 ? "critical" : member.allocated >= 70 ? "warning" : "normal";
                    return (
                      <div key={member.id} className="flex items-center gap-2 p-2 rounded border bg-[var(--panel-soft)]/40 hover:bg-[var(--panel-soft)]/60 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium truncate">{member.name}</p>
                            <span className={cn(
                              "text-[10px] font-medium",
                              loadLevel === "critical" && "text-rose-500",
                              loadLevel === "warning" && "text-amber-500",
                              loadLevel === "normal" && "text-muted-foreground"
                            )}>
                              {member.allocated}%
                            </span>
                          </div>
                          <div className="mt-1">
                            <div className="h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-300",
                                  loadLevel === "critical" && "bg-rose-500",
                                  loadLevel === "warning" && "bg-amber-500",
                                  loadLevel === "normal" && "bg-[var(--brand)]"
                                )}
                                style={{ width: `${member.allocated}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Risk Mix */}
            <Card className="p-3">
              <h3 className="text-xs font-medium mb-2">{t("dashboard.riskMix")}</h3>
              <div className="grid gap-2 grid-cols-2">
                <ClientChart className="h-32">
                  <DashboardRiskChart data={riskData} />
                </ClientChart>
                <div className="space-y-1">
                  {riskData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 p-1.5 rounded border bg-[var(--panel-soft)]/40">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-[10px] flex-1">{entry.name}</span>
                      <span className="text-xs font-bold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-3">
              <h3 className="text-xs font-medium mb-2">Quick Actions</h3>
              <div className="grid gap-1.5">
                <Button size="sm" variant="outline" onClick={() => setTaskModalOpen(true)} className="h-8 text-xs justify-start">
                  <Plus className="h-3 w-3 mr-2" />
                  {t("action.addTask")}
                </Button>
                <Link className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs justify-start" })} href="/projects">
                  {t("action.openPortfolio")}
                  <ArrowUpRight className="h-3 w-3 ml-auto" />
                </Link>
                <Link className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs justify-start" })} href="/analytics">
                  {t("nav.analytics")}
                  <ArrowUpRight className="h-3 w-3 ml-auto" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ProjectFormModal open={projectModalOpen} onOpenChange={setProjectModalOpen} />
      <ProjectFormModal
        open={Boolean(editingProject)}
        onOpenChange={(open) => { if (!open) setEditingProject(null); }}
        project={editingProject}
      />
      <TaskFormModal open={taskModalOpen} onOpenChange={setTaskModalOpen} />
    </>
  );
}
