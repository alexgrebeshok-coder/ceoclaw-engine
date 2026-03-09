"use client";

import { useEffect, useMemo, useRef } from "react";
import { Sparkles } from "lucide-react";

import { ChatMessage } from "@/components/chat/chat-message";
import { Card, CardContent } from "@/components/ui/card";
import { useAIWorkspace } from "@/contexts/ai-context";
import { useLocale } from "@/contexts/locale-context";

export function ChatMessages() {
  const { runs, selectedRunId } = useAIWorkspace();
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const orderedRuns = useMemo(
    () =>
      [...runs].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      ),
    [runs]
  );

  useEffect(() => {
    if (selectedRunId) {
      document.getElementById(`assistant-message-${selectedRunId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [orderedRuns.length, selectedRunId]);

  if (!orderedRuns.length) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-2xl border-dashed">
          <CardContent className="grid gap-4 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--panel-soft)] text-[var(--brand)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
                {t("chat.emptyTitle")}
              </h3>
              <p className="text-sm leading-7 text-[var(--ink-soft)]">
                {t("chat.emptyDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" ref={containerRef}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-6 sm:px-8">
        {orderedRuns.map((run) => (
          <ChatMessage key={run.id} run={run} selected={selectedRunId === run.id} />
        ))}
      </div>
    </div>
  );
}
