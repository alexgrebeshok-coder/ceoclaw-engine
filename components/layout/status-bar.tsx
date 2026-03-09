"use client";

import { useLocale } from "@/contexts/locale-context";
import { useDashboard } from "@/components/dashboard-provider";

export function StatusBar() {
  const { locale, t } = useLocale();
  const { notifications, projects, tasks } = useDashboard();
  const inProgressCount = tasks.filter((task) => task.status === "in-progress").length;
  const timestamp = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <footer className="shrink-0 flex h-7 items-center justify-between border-t border-[var(--line-strong)] bg-[var(--statusbar-surface)] px-4 text-xs text-[var(--statusbar-ink)]">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          {t("shell.online")}
        </span>
        <span>
          {projects.length} {t("nav.projects").toLowerCase()}
        </span>
        <span>
          {tasks.length} {t("tasks.total").toLowerCase()}
        </span>
        <span>
          {inProgressCount} {t("tasks.inProgress").toLowerCase()}
        </span>
        <span>
          {notifications.length} {t("topbar.criticalFeed").toLowerCase()}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>
          {t("shell.lastSync")}: {timestamp}
        </span>
        <span>v1.0.0</span>
      </div>
    </footer>
  );
}
