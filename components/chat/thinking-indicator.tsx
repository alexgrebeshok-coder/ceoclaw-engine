"use client";

import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/contexts/locale-context";

export function ThinkingIndicator({ progress }: { progress: number }) {
  const { t } = useLocale();

  return (
    <div className="mb-3 inline-flex max-w-full items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface-panel-strong)] px-3 py-2 text-sm text-[var(--ink-soft)] shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
      <span className="animate-pulse" aria-hidden>
        🤔
      </span>
      <Progress className="h-1.5 w-24" value={progress} />
      <span className="text-xs font-medium">{t("chat.thinking")}</span>
    </div>
  );
}
