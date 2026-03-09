import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  CircleHelp,
  Columns3,
  LayoutDashboard,
  LineChart,
  MessageSquareText,
  Settings2,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { type MessageKey } from "@/lib/translations";
import type { Project } from "@/lib/types";

export const navigation: Array<{ href: string; labelKey: MessageKey; icon: LucideIcon }> = [
  { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/projects", labelKey: "nav.projects", icon: BriefcaseBusiness },
  { href: "/tasks", labelKey: "nav.tasks", icon: Workflow },
  { href: "/kanban", labelKey: "nav.kanban", icon: Columns3 },
  { href: "/calendar", labelKey: "nav.calendar", icon: CalendarDays },
  { href: "/gantt", labelKey: "nav.gantt", icon: LineChart },
  { href: "/analytics", labelKey: "nav.analytics", icon: Sparkles },
  { href: "/team", labelKey: "nav.team", icon: Users },
  { href: "/risks", labelKey: "nav.risks", icon: AlertTriangle },
  { href: "/chat", labelKey: "nav.chat", icon: MessageSquareText },
];

export const footerNavigation: Array<{ href: string; labelKey: MessageKey; icon: LucideIcon }> = [
  { href: "/settings", labelKey: "nav.settings", icon: Settings2 },
  { href: "/help", labelKey: "nav.help", icon: CircleHelp },
];

const localizedPageTitles: Record<string, { eyebrowKey: MessageKey; titleKey: MessageKey }> = {
  "/": { eyebrowKey: "page.dashboard.eyebrow", titleKey: "page.dashboard.title" },
  "/projects": { eyebrowKey: "page.projects.eyebrow", titleKey: "page.projects.title" },
  "/tasks": { eyebrowKey: "page.tasks.eyebrow", titleKey: "page.tasks.title" },
  "/kanban": { eyebrowKey: "page.kanban.eyebrow", titleKey: "page.kanban.title" },
  "/calendar": { eyebrowKey: "page.calendar.eyebrow", titleKey: "page.calendar.title" },
  "/gantt": { eyebrowKey: "page.gantt.eyebrow", titleKey: "page.gantt.title" },
  "/analytics": { eyebrowKey: "page.analytics.eyebrow", titleKey: "page.analytics.title" },
  "/team": { eyebrowKey: "page.team.eyebrow", titleKey: "page.team.title" },
  "/risks": { eyebrowKey: "page.risks.eyebrow", titleKey: "page.risks.title" },
  "/chat": { eyebrowKey: "page.chat.eyebrow", titleKey: "page.chat.title" },
  "/settings": { eyebrowKey: "page.settings.eyebrow", titleKey: "page.settings.title" },
  "/help": { eyebrowKey: "page.help.eyebrow", titleKey: "page.help.title" },
};

export function resolveTitle(pathname: string | null): {
  eyebrowKey: MessageKey;
  titleKey: MessageKey;
} {
  const safePathname = pathname ?? "/";

  if (safePathname.startsWith("/projects/")) {
    return {
      eyebrowKey: "page.project.eyebrow",
      titleKey: "page.project.title",
    };
  }

  return localizedPageTitles[safePathname as keyof typeof localizedPageTitles] ?? localizedPageTitles["/"];
}

export function getProjectTone(status: Project["status"]): string {
  switch (status) {
    case "active":
      return "bg-emerald-500";
    case "planning":
      return "bg-sky-500";
    case "completed":
      return "bg-violet-500";
    case "at-risk":
      return "bg-rose-500";
    default:
      return "bg-amber-500";
  }
}
