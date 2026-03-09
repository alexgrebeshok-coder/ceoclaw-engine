"use client";

import { useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { useAIWorkspace } from "@/contexts/ai-context";
import { useLocale } from "@/contexts/locale-context";
import { cn } from "@/lib/utils";

export function AIComposer() {
  const [prompt, setPrompt] = useState("");
  const {
    activeContext,
    agents,
    isSubmitting,
    quickActions,
    runQuickAction,
    selectedAgentId,
    setSelectedAgentId,
    submitPrompt,
  } = useAIWorkspace();
  const { t } = useLocale();

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    await submitPrompt(prompt);
    setPrompt("");
  };

  return (
    <div className="border-t border-[color:var(--line-strong)] bg-[color:var(--surface-panel)] p-5 backdrop-blur-xl">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            {t("ai.agentsTitle")}
          </span>
          {agents.map((agent) => (
            <button
              key={agent.id}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                selectedAgentId === agent.id
                  ? "border-[var(--brand)] bg-[var(--panel-soft)] text-[var(--brand)]"
                  : "border-[var(--line)] bg-[color:var(--surface-panel-strong)] text-[var(--ink-soft)] hover:border-[var(--brand)]/35 hover:text-[var(--ink)]"
              )}
              onClick={() => setSelectedAgentId(agent.id)}
            >
              {t(agent.nameKey)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            {t("ai.quickActionsTitle")}
          </span>
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="rounded-full border border-[var(--line)] bg-[color:var(--surface-panel-strong)] px-3 py-1.5 text-sm text-[var(--ink-soft)] transition hover:border-[var(--brand)]/35 hover:text-[var(--ink)]"
              onClick={() => void runQuickAction(action.id)}
            >
              {t(action.labelKey)}
            </button>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              {t("ai.askAssistant")}
            </label>
            <Textarea
              className="min-h-[124px] bg-[color:var(--field)]"
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder={t("ai.composerPlaceholder", { context: activeContext.title })}
              value={prompt}
            />
          </div>

          <Button
            className="h-12 lg:min-w-[180px]"
            disabled={isSubmitting || !prompt.trim()}
            onClick={() => void handleSubmit()}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                {t("ai.submitting")}
              </>
            ) : (
              <>
                <ArrowUpRight className="h-4 w-4" />
                {t("ai.send")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
