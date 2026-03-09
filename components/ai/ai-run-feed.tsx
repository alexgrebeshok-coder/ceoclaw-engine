"use client";

import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useAIWorkspace } from "@/contexts/ai-context";
import { useLocale } from "@/contexts/locale-context";
import type { MessageKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

const statusTone = {
  queued: "neutral" as const,
  running: "info" as const,
  needs_approval: "warning" as const,
  done: "success" as const,
  failed: "danger" as const,
};

const statusLabelKey: Record<keyof typeof statusTone, MessageKey> = {
  queued: "ai.runStatus.queued",
  running: "ai.runStatus.running",
  needs_approval: "ai.runStatus.needs_approval",
  done: "ai.runStatus.done",
  failed: "ai.runStatus.failed",
};

export function AIRunFeed() {
  const { locale, t } = useLocale();
  const { runs, selectRun, selectedRunId } = useAIWorkspace();

  if (!runs.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-[color:var(--surface-panel)]/72 p-5 text-sm text-[var(--ink-muted)]">
        {t("ai.runFeedEmpty")}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {runs.map((run) => (
        <button
          key={run.id}
          className={cn(
            "rounded-[24px] border border-transparent bg-[color:var(--surface-panel)]/86 p-4 text-left shadow-[0_12px_32px_rgba(15,23,42,.06)] transition hover:border-[var(--brand)]/35 hover:bg-[color:var(--surface-panel-strong)]",
            selectedRunId === run.id &&
              "border-[var(--brand)]/45 bg-[color:var(--surface-panel-strong)]"
          )}
          onClick={() => selectRun(run.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--ink)]">{run.title}</p>
              <p className="line-clamp-2 text-sm text-[var(--ink-soft)]">{run.prompt}</p>
            </div>
            <Badge variant={statusTone[run.status]}>{t(statusLabelKey[run.status])}</Badge>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--ink-muted)]">
            <Clock3 className="h-3.5 w-3.5" />
            <span>
              {new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale, {
                hour: "2-digit",
                minute: "2-digit",
                month: "short",
                day: "numeric",
              }).format(new Date(run.createdAt))}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
