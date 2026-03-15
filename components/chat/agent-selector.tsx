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
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
        <Input
          aria-label={t("chat.sidebar.searchAgents")}
          className="h-9 pl-10 text-sm"
          id="chat-agent-search"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={t("chat.sidebar.searchPlaceholder")}
          value={searchQuery}
        />
      </div>

      <p className="sr-only" id="chat-agent-selector-help">
        {t("chat.sidebar.agentSelectorHelp")}
      </p>

      <div className="max-h-[380px] overflow-y-auto rounded-[10px] border border-[var(--line)] bg-[color:var(--surface-panel)] p-1.5">
        {hasMatches ? (
          <div className="space-y-2">
            {groupedAgents.map(({ category, items }) => (
              <div key={category.id}>
                <div className="sticky top-0 z-[1] rounded-[8px] bg-[color:var(--surface-panel)] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                  {t(category.labelKey)}
                </div>
                <div className="space-y-0.5">
                  {items.map((agent) => {
                    const description = t(agent.descriptionKey ?? kindDescriptionKey[agent.kind]);
                    const selected = selectedAgentId === agent.id;

                    return (
                      <Tooltip
                        key={agent.id}
                        content={
                          <div className="max-w-[280px] space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{agent.icon}</span>
                              <p className="text-sm font-semibold text-[var(--ink)]">
                                {t(agent.nameKey)}
                              </p>
                            </div>
                            <p className="text-xs leading-5 text-[var(--ink-soft)]">
                              {description}
                            </p>
                          </div>
                        }
                      >
                        <button
                          aria-describedby="chat-agent-selector-help"
                          aria-label={`${t("chat.sidebar.agent")}: ${t(agent.nameKey)}`}
                          aria-pressed={selected}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left transition-all duration-150",
                            selected
                              ? "bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20"
                              : "hover:bg-[var(--surface-panel-strong)]"
                          )}
                          onClick={() => {
                            setSelectedAgentId(agent.id);
                            setSearchQuery("");
                          }}
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-white/60 text-base dark:bg-white/10">
                            <span aria-hidden>{agent.icon}</span>
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-[13px] font-medium text-[var(--ink)]">
                                {t(agent.nameKey)}
                              </p>
                              {agent.recommended ? (
                                <span className="shrink-0 rounded-full bg-[var(--brand)]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--brand)]">
                                  {t("chat.sidebar.recommended")}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {selected && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                          )}
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-dashed border-[var(--line)] bg-[color:var(--surface-panel-strong)] px-3 py-4 text-xs text-[var(--ink-muted)]">
            {t("chat.sidebar.noAgents")}
          </div>
        )}
      </div>
    </div>
  );
}
