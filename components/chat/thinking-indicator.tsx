"use client";

import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/contexts/locale-context";

export function ThinkingIndicator({ progress }: { progress: number }) {
  const { t } = useLocale();

  return (
    <div className="mb-3 flex items-center gap-3 rounded-full bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--ink-soft)]">
      <span className="animate-pulse" aria-hidden>
        🤔
      </span>
      <Progress className="h-1.5 w-24" value={progress} />
      <span className="text-xs font-medium">{t("chat.thinking")}</span>
    </div>
  );
}
