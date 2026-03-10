"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsDashboardProps {
  projectId?: string;
}

const COLORS = {
  todo: "#94a3b8",
  in_progress: "#3b82f6",
  review: "#f59e0b",
  done: "#22c55e",
};

export const AnalyticsDashboard = React.memo(function AnalyticsDashboard({
  projectId,
}: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAnalytics() {
      try {
        const url = projectId
          ? `/api/analytics/overview?projectId=${projectId}`
          : "/api/analytics/overview";
        const response = await fetch(url);
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error("[AnalyticsDashboard] Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [projectId]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="h-24 animate-pulse rounded bg-[var(--surface-secondary)]" />
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-6 text-center text-[var(--ink-muted)]">
        No analytics data available
      </Card>
    );
  }

  const { summary, projects } = analytics;

  // Prepare chart data
  const statusData = projects.map((p: any) => ({
    name: p.projectName.slice(0, 10),
    todo: p.statusBreakdown.todo,
    inProgress: p.statusBreakdown.inProgress,
    review: p.statusBreakdown.review,
    done: p.statusBreakdown.done,
  }));

  const healthData = projects.map((p: any) => ({
    name: p.projectName.slice(0, 15),
    health: p.healthScore,
  }));

  const pieData = [
    { name: "To Do", value: summary.totalTasks > 0 ? projects.reduce((sum: number, p: any) => sum + p.statusBreakdown.todo, 0) : 0 },
    { name: "In Progress", value: projects.reduce((sum: number, p: any) => sum + p.statusBreakdown.inProgress, 0) },
    { name: "Review", value: projects.reduce((sum: number, p: any) => sum + p.statusBreakdown.review, 0) },
    { name: "Done", value: projects.reduce((sum: number, p: any) => sum + p.statusBreakdown.done, 0) },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="text-sm font-medium text-[var(--ink-muted)]">
            Total Projects
          </div>
          <div className="mt-2 text-3xl font-bold">{summary.totalProjects}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-[var(--ink-muted)]">
            Total Tasks
          </div>
          <div className="mt-2 text-3xl font-bold">{summary.totalTasks}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-[var(--ink-muted)]">
            Avg Progress
          </div>
          <div className="mt-2 text-3xl font-bold">{summary.avgProgress}%</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-[var(--ink-muted)]">
            Avg Health Score
          </div>
          <div className="mt-2 text-3xl font-bold">{summary.avgHealthScore}</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Breakdown */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Status by Project</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="todo" stackId="a" fill={COLORS.todo} />
                <Bar dataKey="inProgress" stackId="a" fill={COLORS.in_progress} />
                <Bar dataKey="review" stackId="a" fill={COLORS.review} />
                <Bar dataKey="done" stackId="a" fill={COLORS.done} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-[var(--ink-muted)]">
              No data available
            </div>
          )}
        </Card>

        {/* Health Scores */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Project Health</h3>
          {healthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="health" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-[var(--ink-muted)]">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Overall Status Pie */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Overall Task Status</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-[var(--ink-muted)]">
            No tasks available
          </div>
        )}
        <div className="mt-4 flex justify-center gap-6">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: Object.values(COLORS)[index] }}
              />
              <span className="text-sm">{entry.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
});
