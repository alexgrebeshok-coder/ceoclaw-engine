import { type ClassValue, clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

import {
  Priority,
  ProjectDirection,
  ProjectStatus,
  RiskStatus,
  Severity,
  TaskStatus,
} from "@/lib/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const projectStatusMeta: Record<
  ProjectStatus,
  { label: string; className: string; accent: string }
> = {
  active: {
    label: "В работе",
    className: "bg-[#3b82f6] text-white ring-[#3b82f6]/20",
    accent: "bg-[#3b82f6]",
  },
  planning: {
    label: "Планирование",
    className: "bg-[#f59e0b] text-white ring-[#f59e0b]/20",
    accent: "bg-[#f59e0b]",
  },
  "on-hold": {
    label: "Пауза",
    className: "bg-[var(--panel-soft)] text-[var(--ink-soft)] ring-[var(--line)]",
    accent: "bg-[var(--panel-soft-strong)]",
  },
  completed: {
    label: "Завершён",
    className: "bg-[#28c840] text-white ring-[#28c840]/20",
    accent: "bg-[#28c840]",
  },
  "at-risk": {
    label: "Красная зона",
    className: "bg-[#ef4444] text-white ring-[#ef4444]/20",
    accent: "bg-[#ef4444]",
  },
};

export const taskStatusMeta: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  todo: {
    label: "To Do",
    className: "bg-[var(--panel-soft)] text-[var(--ink-soft)] ring-[var(--line)]",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-[#3b82f6] text-white ring-[#3b82f6]/20",
  },
  done: {
    label: "Done",
    className: "bg-[#28c840] text-white ring-[#28c840]/20",
  },
  blocked: {
    label: "Blocked",
    className: "bg-[#ef4444] text-white ring-[#ef4444]/20",
  },
};

export const priorityMeta: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-[var(--panel-soft)] text-[var(--ink-soft)] ring-[var(--line)]" },
  medium: {
    label: "Medium",
    className: "bg-[#f59e0b] text-white ring-[#f59e0b]/20",
  },
  high: { label: "High", className: "bg-[#fb923c] text-white ring-[#fb923c]/20" },
  critical: {
    label: "Critical",
    className: "bg-[#ef4444] text-white ring-[#ef4444]/20",
  },
};

export const directionMeta: Record<ProjectDirection, string> = {
  metallurgy: "Металлургия",
  logistics: "Логистика",
  trade: "Трейдинг",
  construction: "Строительство",
};

export const severityMeta: Record<
  Severity,
  { label: string; className: string }
> = {
  info: { label: "Info", className: "bg-sky-50 text-sky-700" },
  warning: { label: "Warning", className: "bg-amber-50 text-amber-700" },
  critical: { label: "Critical", className: "bg-rose-50 text-rose-700" },
};

export const riskStatusMeta: Record<
  RiskStatus,
  { label: string; className: string }
> = {
  open: { label: "Открыт", className: "bg-[#ef4444] text-white ring-[#ef4444]/20" },
  mitigated: {
    label: "Под контролем",
    className: "bg-[#f59e0b] text-white ring-[#f59e0b]/20",
  },
  closed: {
    label: "Закрыт",
    className: "bg-[#28c840] text-white ring-[#28c840]/20",
  },
};

export function formatCurrency(value: number, currency = "RUB"): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string, pattern = "d MMM"): string {
  return format(parseISO(value), pattern, { locale: ru });
}

export function initials(value: string): string {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max);
}

export function getHealthTone(value: number): string {
  if (value >= 80) return "text-emerald-600";
  if (value >= 60) return "text-amber-600";
  return "text-rose-600";
}

export function getRiskSeverity(probability: number, impact: number): Severity {
  const score = probability * impact;
  if (score >= 16) return "critical";
  if (score >= 9) return "warning";
  return "info";
}

export function safePercent(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}
