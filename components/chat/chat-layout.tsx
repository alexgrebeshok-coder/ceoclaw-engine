"use client";

import { useEffect, useState } from "react";
import { MessageSquareMore, PanelLeftOpen, PanelRightClose } from "lucide-react";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAIWorkspace } from "@/contexts/ai-context";
import { useLocale } from "@/contexts/locale-context";
import type { AIWorkspaceMode } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

const modeLabelKey: Record<AIWorkspaceMode, "ai.mode.auto" | "ai.mode.mock" | "ai.mode.gateway"> = {
  auto: "ai.mode.auto",
  mock: "ai.mode.mock",
  gateway: "ai.mode.gateway",
};

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { activeContext, currentSession, preferredMode } = useAIWorkspace();
  const { t } = useLocale();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key !== "/" && event.code !== "Slash") return;

      event.preventDefault();

      if (window.matchMedia("(min-width: 768px)").matches) {
        setSidebarOpen((current) => !current);
        return;
      }

      setMobileSidebarOpen((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative h-[calc(100vh-8rem)] min-h-[720px] overflow-hidden rounded-[12px] border border-[color:var(--line-strong)] bg-[color:var(--surface-panel)]">
      <div className="flex h-full">
        <aside
          className={cn(
            "hidden h-full border-r border-[color:var(--line-strong)] bg-[color:var(--surface-sidebar)] md:block",
            sidebarOpen ? "w-80" : "w-0 overflow-hidden border-r-0"
          )}
          id="chat-sidebar-panel"
        >
          {sidebarOpen ? <ChatSidebar /> : null}
        </aside>

        {mobileSidebarOpen ? (
          <div
            className="absolute inset-0 z-20 bg-black/60 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div
              className="h-full w-[88vw] max-w-[360px] border-r border-[color:var(--line-strong)] bg-[color:var(--surface-sidebar-mobile)] shadow-xl"
              id="chat-sidebar-panel-mobile"
              onClick={(event) => event.stopPropagation()}
            >
              <ChatSidebar onClose={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-[color:var(--line-strong)] bg-[color:var(--surface-panel)] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Button
                aria-controls="chat-sidebar-panel-mobile"
                aria-expanded={mobileSidebarOpen}
                aria-label={t("chat.sidebar.toggle")}
                className="md:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                size="icon"
                variant="secondary"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
              <Button
                aria-controls="chat-sidebar-panel"
                aria-expanded={sidebarOpen}
                aria-label={t("chat.sidebar.toggle")}
                className="hidden md:inline-flex"
                onClick={() => setSidebarOpen((current) => !current)}
                size="icon"
                variant="secondary"
              >
                {sidebarOpen ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </Button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                  {t("page.chat.eyebrow")}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-heading text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
                    {t("page.chat.title")}
                  </h2>
                  <Badge variant="neutral">
                    <MessageSquareMore className="h-3.5 w-3.5" />
                    {activeContext.title}
                  </Badge>
                  <Badge variant="neutral">
                    {currentSession?.title || t("chat.sessionUntitled")}
                  </Badge>
                  <Badge variant="info">{t(modeLabelKey[preferredMode])}</Badge>
                  <span className="rounded-full bg-[var(--panel-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                    ⌘/
                  </span>
                </div>
              </div>
            </div>
          </div>

          <ChatMessages />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
