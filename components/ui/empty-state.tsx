"use client";

import { FolderOpen, ListTodo, Users2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "projects" | "tasks" | "team" | "risks" | "generic";
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const defaultConfig = {
  projects: {
    icon: FolderOpen,
    title: "Нет проектов",
    description: "Создайте первый проект, чтобы начать работу",
    gradient: "from-blue-500/10 via-transparent to-blue-500/10",
    iconBg: "bg-blue-500/12",
    iconColor: "text-blue-500",
  },
  tasks: {
    icon: ListTodo,
    title: "Нет задач",
    description: "Добавьте задачи к проекту для отслеживания прогресса",
    gradient: "from-violet-500/10 via-transparent to-violet-500/10",
    iconBg: "bg-violet-500/12",
    iconColor: "text-violet-500",
  },
  team: {
    icon: Users2,
    title: "Нет команды",
    description: "Добавьте участников для управления нагрузкой",
    gradient: "from-emerald-500/10 via-transparent to-emerald-500/10",
    iconBg: "bg-emerald-500/12",
    iconColor: "text-emerald-500",
  },
  risks: {
    icon: AlertTriangle,
    title: "Нет рисков",
    description: "Отлично! Риски не выявлены",
    gradient: "from-amber-500/10 via-transparent to-amber-500/10",
    iconBg: "bg-amber-500/12",
    iconColor: "text-amber-500",
  },
  generic: {
    icon: FolderOpen,
    title: "Нет данных",
    description: "Данные отсутствуют",
    gradient: "from-slate-500/10 via-transparent to-slate-500/10",
    iconBg: "bg-slate-500/12",
    iconColor: "text-slate-500",
  },
};

export function EmptyState({
  type,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = defaultConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-[var(--line)] bg-[var(--surface-panel)] px-6 py-8 text-center overflow-hidden",
        className
      )}
    >
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none",
          config.gradient
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-full",
          config.iconBg,
          config.iconColor
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Text */}
      <div className="relative space-y-1.5">
        <h3 className="font-semibold text-base text-[var(--ink)]">
          {title || config.title}
        </h3>
        <p className="max-w-sm text-sm text-[var(--ink-soft)]">
          {description || config.description}
        </p>
      </div>

      {/* Optional action */}
      {action && <div className="relative">{action}</div>}
    </div>
  );
}
