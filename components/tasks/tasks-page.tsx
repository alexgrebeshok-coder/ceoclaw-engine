"use client";

import { useMemo, useState } from "react";
import { CheckSquare2, Download, Filter, Plus } from "lucide-react";

import { AIContextActions } from "@/components/ai/ai-context-actions";
import { useDashboard } from "@/components/dashboard-provider";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataErrorState } from "@/components/ui/data-error-state";
import { fieldStyles } from "@/components/ui/field";
import {
  AIContextActionsSkeleton,
  KpiCardSkeleton,
  TaskTableSkeleton,
} from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/contexts/locale-context";
import { downloadTasksCsv } from "@/lib/export";
import { useProjects, useTasks } from "@/lib/hooks/use-api";
import { Priority, TaskStatus } from "@/lib/types";
import { priorityMeta, taskStatusMeta } from "@/lib/utils";

export function TasksPage() {
  const { enumLabel, formatDateLocalized, t } = useLocale();
  const { updateTaskStatus } = useDashboard();
  const { error, isLoading, mutate: mutateTasks, tasks } = useTasks();
  const {
    error: projectsError,
    isLoading: projectsLoading,
    mutate: mutateProjects,
    projects,
  } = useProjects();
  const [status, setStatus] = useState<"all" | TaskStatus>("all");
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [projectFilter, setProjectFilter] = useState<"all" | string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const statusMatch = status === "all" ? true : task.status === status;
        const priorityMatch = priority === "all" ? true : task.priority === priority;
        const projectMatch = projectFilter === "all" ? true : task.projectId === projectFilter;
        const searchMatch = searchQuery === "" ? true : 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        return statusMatch && priorityMatch && projectMatch && searchMatch;
      }),
    [priority, status, projectFilter, searchQuery, tasks]
  );

  const projectNameById = Object.fromEntries(projects.map((project) => [project.id, project.name]));

  const toggleTask = (taskId: string) => {
    setSelectedIds((current) =>
      current.includes(taskId) ? current.filter((item) => item !== taskId) : [...current, taskId]
    );
  };
  const showHydrationSkeleton =
    isLoading && projectsLoading && projects.length === 0 && tasks.length === 0;

  const handleRetry = () => {
    void Promise.all([mutateProjects(), mutateTasks()]);
  };

  // Stats
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;
  const doneTasks = tasks.filter((task) => task.status === "done").length;
  const blockedTasks = tasks.filter((task) => task.status === "blocked").length;

  if (showHydrationSkeleton) {
    return (
      <div className="grid min-w-0 gap-3">
        <AIContextActionsSkeleton />

        <div className="grid gap-2 grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <KpiCardSkeleton key={index} />
          ))}
        </div>

        <TaskTableSkeleton />
      </div>
    );
  }

  if ((error || projectsError) && projects.length === 0 && tasks.length === 0) {
    return (
      <DataErrorState
        actionLabel={t("action.retry")}
        description={t("error.loadDescription")}
        onRetry={handleRetry}
        title={t("error.loadTitle")}
      />
    );
  }

  return (
    <div className="grid min-w-0 gap-3">
      <AIContextActions />

      {/* Compact KPI Row */}
      <div className="grid gap-2 grid-cols-4">
        <Card className="p-2">
          <p className="text-[10px] uppercase text-muted-foreground">{t("tasks.total")}</p>
          <p className="text-lg font-bold">{totalTasks}</p>
        </Card>
        <Card className="p-2">
          <p className="text-[10px] uppercase text-muted-foreground">{t("tasks.inProgress")}</p>
          <p className="text-lg font-bold text-blue-600">{inProgressTasks}</p>
        </Card>
        <Card className="p-2">
          <p className="text-[10px] uppercase text-muted-foreground">{t("tasks.blocked")}</p>
          <p className="text-lg font-bold text-red-600">{blockedTasks}</p>
        </Card>
        <Card className="p-2">
          <p className="text-[10px] uppercase text-muted-foreground">{t("tasks.selected")}</p>
          <p className="text-lg font-bold">{selectedIds.length}</p>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="p-3">
        {/* Header + Filters in one row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">{t("tasks.title")}</h2>
            <span className="text-xs text-muted-foreground">({filteredTasks.length})</span>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              className={`${fieldStyles} !py-1 h-8 text-xs`}
              onChange={(event) => setStatus(event.target.value as "all" | TaskStatus)}
              value={status}
            >
              <option value="all">{t("filters.allStatuses")}</option>
              <option value="todo">{enumLabel("taskStatus", "todo")}</option>
              <option value="in-progress">{enumLabel("taskStatus", "in-progress")}</option>
              <option value="done">{enumLabel("taskStatus", "done")}</option>
              <option value="blocked">{enumLabel("taskStatus", "blocked")}</option>
            </select>
            <select
              className={`${fieldStyles} !py-1 h-8 text-xs`}
              onChange={(event) => setPriority(event.target.value as "all" | Priority)}
              value={priority}
            >
              <option value="all">{t("filters.allPriorities")}</option>
              <option value="low">{enumLabel("priority", "low")}</option>
              <option value="medium">{enumLabel("priority", "medium")}</option>
              <option value="high">{enumLabel("priority", "high")}</option>
              <option value="critical">{enumLabel("priority", "critical")}</option>
            </select>
            <select
              className={`${fieldStyles} !py-1 h-8 text-xs`}
              onChange={(event) => setProjectFilter(event.target.value)}
              value={projectFilter}
            >
              <option value="all">{t("filters.allProjects")}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <input
              className={`${fieldStyles} !py-1 h-8 text-xs w-32`}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("filters.search") || "Search..."}
              type="text"
              value={searchQuery}
            />
            <Button size="sm" onClick={() => setTaskModalOpen(true)} className="h-8">
              <Plus className="h-3 w-3 mr-1" />
              {t("action.addTask")}
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            disabled={!selectedIds.length}
            onClick={() => updateTaskStatus(selectedIds, "in-progress")}
            variant="secondary"
            className="h-7 text-xs"
          >
            <Filter className="h-3 w-3 mr-1" />
            {t("tasks.bulkMove")}
          </Button>
          <Button
            size="sm"
            disabled={!selectedIds.length}
            onClick={() => updateTaskStatus(selectedIds, "done")}
            variant="secondary"
            className="h-7 text-xs"
          >
            <CheckSquare2 className="h-3 w-3 mr-1" />
            {t("tasks.bulkDone")}
          </Button>
          <Button size="sm" onClick={() => downloadTasksCsv(filteredTasks)} variant="outline" className="h-7 text-xs">
            <Download className="h-3 w-3 mr-1" />
            {t("action.exportExcel")}
          </Button>
        </div>

        {/* Compact Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8 py-1.5"></TableHead>
              <TableHead className="py-1.5 text-xs">{t("project.tasks")}</TableHead>
              <TableHead className="py-1.5 text-xs">{t("tasks.project")}</TableHead>
              <TableHead className="py-1.5 text-xs">{t("field.status")}</TableHead>
              <TableHead className="py-1.5 text-xs">{t("tasks.assignee")}</TableHead>
              <TableHead className="py-1.5 text-xs">{t("tasks.dueDate")}</TableHead>
              <TableHead className="py-1.5 text-xs">{t("tasks.priority")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id} className="group">
                <TableCell className="py-1.5">
                  <input
                    checked={selectedIds.includes(task.id)}
                    onChange={() => toggleTask(task.id)}
                    type="checkbox"
                    className="h-3.5 w-3.5"
                  />
                </TableCell>
                <TableCell className="py-1.5">
                  <p className="text-xs font-medium truncate max-w-[200px]">{task.title}</p>
                </TableCell>
                <TableCell className="py-1.5 text-xs text-muted-foreground truncate max-w-[120px]">
                  {projectNameById[task.projectId]}
                </TableCell>
                <TableCell className="py-1.5">
                  <Badge className={`${taskStatusMeta[task.status].className} text-[10px] px-1.5 py-0.5`}>
                    {enumLabel("taskStatus", task.status)}
                  </Badge>
                </TableCell>
                <TableCell className="py-1.5 text-xs text-muted-foreground">
                  {task.assignee?.name || "-"}
                </TableCell>
                <TableCell className="py-1.5 text-xs text-muted-foreground">
                  {formatDateLocalized(task.dueDate, "d MMM")}
                </TableCell>
                <TableCell className="py-1.5">
                  <Badge className={`${priorityMeta[task.priority].className} text-[10px] px-1.5 py-0.5`}>
                    {enumLabel("priority", task.priority)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <TaskFormModal open={taskModalOpen} onOpenChange={setTaskModalOpen} />
    </div>
  );
}
