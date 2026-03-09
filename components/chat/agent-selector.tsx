"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/field";
import { Tooltip } from "@/components/ui/tooltip";
import { useAIWorkspace } from "@/contexts/ai-context";
import { useLocale } from "@/contexts/locale-context";
import { aiAgentCategories } from "@/lib/ai/agents";
import type { AIAgentDefinition } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

const kindDescriptionKey: Record<
  AIAgentDefinition["kind"],
  "ai.agent.analystDescription" | "ai.agent.plannerDescription" | "ai.agent.reporterDescription" | "ai.agent.researcherDescription"
> = {
  analyst: "ai.agent.analystDescription",
  planner: "ai.agent.plannerDescription",
  reporter: "ai.agent.reporterDescription",
  researcher: "ai.agent.researcherDescription",
};

export function AgentSelector() {
  const [searchQuery, setSearchQuery] = useState("");
  const { agents, selectedAgentId, setSelectedAgentId } = useAIWorkspace();
  const { t } = useLocale();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const groupedAgents = useMemo(
    () =>
      aiAgentCategories
        .map((category) => {
          const items = agents.filter((agent) => {
            if (agent.category !== category.id) return false;
            if (category.id === "auto") return true;
            if (!normalizedQuery) return true;

            const searchableText = [
              agent.id,
              t(agent.nameKey),
              t(category.labelKey),
              t(agent.descriptionKey ?? kindDescriptionKey[agent.kind]),
            ]
              .join(" ")
              .toLowerCase();

            return searchableText.includes(normalizedQuery);
          });

          return {
            category,
            items,
          };
        })
        .filter((group) => group.items.length > 0),
    [agents, normalizedQuery, t]
  );

  const hasMatches = groupedAgents.some((group) => group.items.length > 0);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
        <Input
          aria-label={t("chat.sidebar.searchAgents")}
          className="h-11 pl-11"
          id="chat-agent-search"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={t("chat.sidebar.searchPlaceholder")}
          value={searchQuery}
        />
      </div>

      <p className="sr-only" id="chat-agent-selector-help">
        {t("chat.sidebar.agentSelectorHelp")}
      </p>

      <div className="max-h-[420px] overflow-y-auto rounded-[12px] border border-[var(--line)] bg-[color:var(--surface-panel)] p-2">
        {hasMatches ? (
          <div className="grid gap-4">
            {groupedAgents.map(({ category, items }) => (
              <div key={category.id} className="space-y-2">
                <div className="sticky top-0 z-[1] rounded-[10px] bg-[color:var(--surface-panel)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                  {t(category.labelKey)}
                </div>
                <div className="grid gap-2">
                  {items.map((agent) => {
                    const description = t(agent.descriptionKey ?? kindDescriptionKey[agent.kind]);
                    const selected = selectedAgentId === agent.id;

                    return (
                      <button
                        key={agent.id}
                        aria-describedby="chat-agent-selector-help"
                        aria-label={`${t("chat.sidebar.agent")}: ${t(agent.nameKey)}`}
                        aria-pressed={selected}
                        className={cn(
                          "flex items-start gap-3 rounded-[10px] border px-3 py-3 text-left transition-all duration-200",
                          agent.accentClass,
                          selected
                            ? "ring-2 ring-[var(--brand)]/25"
                            : "hover:border-[var(--brand)]/25"
                        )}
                        onClick={() => {
                          setSelectedAgentId(agent.id);
                          setSearchQuery("");
                        }}
                      >
                        <Tooltip
                          content={
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-[var(--ink)]">
                                {t(agent.nameKey)}
                              </p>
                              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                                {t(category.labelKey)}
                              </p>
                              <p className="text-xs leading-5 text-[var(--ink-soft)]">
                                {description}
                              </p>
                            </div>
                          }
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-white/70 text-xl dark:bg-white/10">
                            <span aria-hidden>{agent.icon}</span>
                          </span>
                        </Tooltip>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[var(--ink)]">
                              {t(agent.nameKey)}
                            </p>
                            {agent.recommended ? (
                              <span className="rounded-full bg-[var(--panel-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                                {t("chat.sidebar.recommended")}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm leading-5 text-[var(--ink-soft)]">
                            {description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-[var(--line)] bg-[color:var(--surface-panel-strong)] px-4 py-6 text-sm text-[var(--ink-muted)]">
            {t("chat.sidebar.noAgents")}
          </div>
        )}
      </div>
    </div>
  );
}
