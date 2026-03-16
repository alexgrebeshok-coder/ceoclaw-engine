"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Users, AlertTriangle } from "lucide-react";

import { useLocale } from "@/contexts/locale-context";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/lib/types";
import { cn, formatCurrency, projectStatusMeta } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  taskCount: number;
  onEdit?: (project: Project) => void;
  onDuplicate?: (projectId: string) => void;
}

function ProjectCardComponent({
  project,
  taskCount,
  onEdit,
  onDuplicate,
}: ProjectCardProps) {
  const { enumLabel, formatDateLocalized, t } = useLocale();
  const statusMeta = projectStatusMeta[project.status];

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group relative h-full min-h-[220px] overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-[var(--brand)]/10 cursor-pointer border-2 hover:border-[var(--brand)]/50">
        {/* Gradient border effect based on status */}
        <div className={cn(
          "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
          "bg-gradient-to-br",
          project.status === "active" && "from-emerald-500/5 via-transparent to-emerald-500/5",
          project.status === "planning" && "from-blue-500/5 via-transparent to-blue-500/5",
          project.status === "at-risk" && "from-amber-500/5 via-transparent to-amber-500/5",
          project.status === "completed" && "from-violet-500/5 via-transparent to-violet-500/5"
        )} />
        {/* Status bar at top */}
        <div className={cn("h-1.5 w-full opacity-80", statusMeta.className)} />

        <div className="p-4 space-y-3">
          {/* Header: Status + Name + Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("text-xs px-2 py-0.5 opacity-80", statusMeta.className)}>
                {enumLabel("projectStatus", project.status)}
              </Badge>
              {project.location && (
                <span className="flex items-center gap-1 text-xs text-[var(--ink-soft)]">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{project.location}</span>
                </span>
              )}
            </div>
            <h3 className="font-semibold text-base text-[var(--ink)] line-clamp-2 leading-tight">
              {project.name}
            </h3>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--ink-soft)]">{t("project.progressLabel")}</span>
              <span className="font-medium text-[var(--ink)]">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* Budget */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--ink-soft)]">{t("dashboard.evm.budget")}</span>
            <span className="text-sm font-semibold text-[var(--ink)]">
              {formatCurrency(project.budget.planned, project.budget.currency)}
            </span>
          </div>

          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-[var(--ink-soft)]">
            <span className="flex-1 truncate text-left">{formatDateLocalized(project.dates.start, "d MMM")}</span>
            <span className="px-1.5 flex-shrink-0">→</span>
            <span className="flex-1 truncate text-right">{formatDateLocalized(project.dates.end, "d MMM")}</span>
          </div>

          {/* Footer: Team + Tasks + Risks + Milestone */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
            <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)]">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {project.team.length}
              </span>
              <span>{taskCount} {t("dashboard.activeTasks")}</span>
              {project.risks > 0 && (
                <span className="flex items-center gap-0.5 text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  {project.risks}
                </span>
              )}
            </div>
            {project.nextMilestone && (
              <span className="flex items-center gap-1 text-xs text-[var(--ink-soft)]">
                <Calendar className="h-3 w-3" />
                {formatDateLocalized(project.nextMilestone.date, "d MMM")}
              </span>
            )}
          </div>

          {/* Hover indicator */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-5 w-5 text-[var(--brand)]" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export const ProjectCard = memo(ProjectCardComponent);
