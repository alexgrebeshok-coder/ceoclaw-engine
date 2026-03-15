"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAIWorkspace } from "@/contexts/ai-context";
import { useLocale } from "@/contexts/locale-context";
import { cn } from "@/lib/utils";

export function AIContextActions({
  className,
  limit = 3,
}: {
  className?: string;
  limit?: number;
}) {
  const router = useRouter();
  const { activeContext, quickActions, runQuickAction } = useAIWorkspace();
  const { t } = useLocale();
  const visibleActions = quickActions.slice(0, limit);

  return (
    <Card
      className={cn(
        "overflow-hidden border border-[color:var(--line-strong)] bg-[color:var(--surface-panel)]",
        className
      )}
    >
      <CardContent className="grid gap-[var(--spacing-lg)] p-4">
        <div className="flex flex-wrap items-start justify-between gap-[var(--spacing-md)]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-[8px] bg-[var(--panel-soft)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
              <Sparkles className="h-3.5 w-3.5" />
              {t("ai.contextActionsTitle")}
            </div>
            <h3 className="font-heading text-[1.75rem] font-semibold tracking-[-0.05em] text-[var(--ink)]">
              {activeContext.title}
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              {t("ai.contextActionsDescription")}
            </p>
          </div>

          <Button onClick={() => router.push("/chat")} variant="outline">
            {t("ai.openWorkspace")}
          </Button>
        </div>

        <div className="grid gap-[var(--spacing-sm)] lg:grid-cols-3">
          {visibleActions.map((action) => (
            <button
              aria-label={t(action.labelKey)}
              key={action.id}
              className="rounded-md border border-[var(--line)] bg-[color:var(--surface-panel-strong)] p-4 text-left transition hover:bg-[var(--panel-soft)]"
              onClick={async () => {
                await runQuickAction(action.id);
                router.push("/chat");
              }}
            >
              <p className="font-medium text-[var(--ink)]">{t(action.labelKey)}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                {t(action.descriptionKey)}
              </p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
