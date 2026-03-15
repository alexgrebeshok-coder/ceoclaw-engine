"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { useDashboard } from "@/components/dashboard-provider";
import { ClientChart } from "@/components/ui/client-chart";
import { Card } from "@/components/ui/card";
import { fieldStyles } from "@/components/ui/field";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/contexts/locale-context";
import { formatCurrency, leadingLabel } from "@/lib/utils";

const AnalyticsTrendChart = dynamic(
  () =>
    import("@/components/analytics/analytics-trend-chart").then(
      (module) => module.AnalyticsTrendChart
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const AnalyticsHealthChart = dynamic(
  () =>
    import("@/components/analytics/analytics-health-chart").then(
      (module) => module.AnalyticsHealthChart
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const AnalyticsBudgetChart = dynamic(
  () =>
    import("@/components/analytics/analytics-budget-chart").then(
      (module) => module.AnalyticsBudgetChart
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

export function AnalyticsPage() {
  const { t } = useLocale();
  const { projects, team } = useDashboard();
  const [period, setPeriod] = useState("90d");

  const portfolioHealthData = projects.map((project) => ({
    name: leadingLabel(project.name),
    health: project.health,
    budgetVariance: Math.round(((project.budget.actual - project.budget.planned) / project.budget.planned) * 100),
  }));

  const progressTrend = projects[0]?.history.map((point, index) => ({
    name: point.date.slice(5),
    progress: Math.round(
      projects.reduce((sum, project) => sum + (project.history[index]?.progress ?? project.progress), 0) /
        projects.length
    ),
    spend: Math.round(
      projects.reduce((sum, project) => sum + (project.history[index]?.budgetActual ?? project.budget.actual), 0) /
        1000
    ),
  })) ?? [];

  const healthMix = [
    {
      name: t("analytics.mixHealthy"),
      value: projects.filter((project) => project.health >= 75).length,
      color: "#10b981",
    },
    {
      name: t("analytics.mixAttention"),
      value: projects.filter((project) => project.health >= 60 && project.health < 75).length,
      color: "#f59e0b",
    },
    {
      name: t("analytics.mixCritical"),
      value: projects.filter((project) => project.health < 60).length,
      color: "#fb7185",
    },
  ];

  const utilization = team.map((member) => ({
    name: member.name,
    allocated: member.allocated,
  }));

  return (
    <div className="grid gap-3">
      {/* Header */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">{t("analytics.title")}</h2>
            <p className="text-[10px] text-muted-foreground">{t("analytics.description")}</p>
          </div>
          <select 
            className={`${fieldStyles} !py-1 h-8 text-xs`} 
            onChange={(event) => setPeriod(event.target.value)} 
            value={period}
          >
            <option value="30d">{t("analytics.period30d")}</option>
            <option value="90d">{t("analytics.period90d")}</option>
            <option value="180d">{t("analytics.period180d")}</option>
          </select>
        </div>
      </Card>

      {/* Charts Grid 2x2 */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Trend Chart */}
        <Card className="p-3">
          <h3 className="text-xs font-medium mb-2">{t("analytics.trendline")}</h3>
          <ClientChart className="h-48">
            <AnalyticsTrendChart data={progressTrend} />
          </ClientChart>
        </Card>

        {/* Health Mix */}
        <Card className="p-3">
          <h3 className="text-xs font-medium mb-2">{t("analytics.healthMix")}</h3>
          <div className="grid gap-2 lg:grid-cols-2">
            <ClientChart className="h-36">
              <AnalyticsHealthChart data={healthMix} />
            </ClientChart>
            <div className="space-y-1.5">
              {healthMix.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between p-2 rounded border bg-[var(--panel-soft)]/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[10px]">{entry.name}</span>
                  </div>
                  <span className="text-sm font-bold">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Budget Variance */}
        <Card className="p-3">
          <h3 className="text-xs font-medium mb-2">{t("analytics.budgetVariance")}</h3>
          <ClientChart className="h-48">
            <AnalyticsBudgetChart data={portfolioHealthData} />
          </ClientChart>
        </Card>

        {/* Resource Utilization */}
        <Card className="p-3">
          <h3 className="text-xs font-medium mb-2">{t("analytics.resourceUtilization")}</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {utilization.map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-2 p-2 rounded border bg-[var(--panel-soft)]/40"
              >
                <span className="text-xs flex-1 truncate">{member.name}</span>
                <span className="text-[10px] text-muted-foreground w-8 text-right">{member.allocated}%</span>
                <div className="w-16 h-1.5 rounded-full bg-[var(--panel-soft-strong)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand)]"
                    style={{ width: `${member.allocated}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Financial Snapshot - Compact */}
      <Card className="p-3">
        <h3 className="text-xs font-medium mb-2">{t("analytics.financialSnapshot")}</h3>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          {projects.slice(0, 4).map((project) => (
            <div
              key={project.id}
              className="p-2 rounded border bg-[var(--panel-soft)]/40"
            >
              <p className="text-xs font-medium truncate">{project.name}</p>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>{formatCurrency(project.budget.planned, project.budget.currency)}</span>
                <span className="text-[var(--ink-soft)]">
                  {formatCurrency(project.budget.actual, project.budget.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
